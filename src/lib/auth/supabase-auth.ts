import { initializeApp, getApps } from 'firebase/app'
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { supabase } from '@/services/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export interface AuthUser {
  user_id: string
  username: string
  email: string
  first_name: string
  last_name: string
  profile_picture: string
  role: 'citizen' | 'admin' | 'personnel' | 'super-admin'
  is_active: boolean
  status_id: string
  created_at: string
  firebase_uid: string  // Store Firebase UID for future reference
}

export class AuthService {
  
  // Sign in with Google using Firebase Auth
  static async signInWithGoogle() {
    try {
      console.log('🚀 Starting Google authentication with Firebase...')
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      console.log('✅ Firebase auth successful:', user.email)
      
      // Store/update user in Supabase database
      await this.syncUserToSupabase(user)
      
      return { user, error: null }
    } catch (error) {
      console.error('❌ Google auth error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Sign out from Firebase
  static async signOut() {
    try {
      console.log('🚪 Signing out from Firebase...')
      
      // Update user status to offline in Supabase before signing out
      const currentUser = auth.currentUser
      if (currentUser && currentUser.email) {
        // Get the "Offline" status ID
        const { data: statusData } = await supabase
          .from('dim_status')
          .select('status_id')
          .eq('status_name', 'Offline')
          .single()
        
        if (statusData) {
          // Update status by email instead of user_id
          await supabase
            .from('dim_user')
            .update({ 
              status_id: statusData.status_id,
              updated_at: new Date().toISOString()
            })
            .eq('email', currentUser.email)
        }
      }
      
      await firebaseSignOut(auth)
      
      console.log('✅ User signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      return { error: error as Error }
    }
  }

  // Get current Firebase user and sync with Supabase
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const firebaseUser = auth.currentUser
      
      if (!firebaseUser) {
        return null
      }

      // Get user details from Supabase database by email
      const { data: userData, error: userError } = await supabase
        .from('dim_user')
        .select('*')
        .eq('email', firebaseUser.email)
        .single()

      if (userError || !userData) {
        console.log('User not found in Supabase, creating new entry...')
        return await this.syncUserToSupabase(firebaseUser)
      }

      return {
        user_id: userData.user_id,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        profile_picture: userData.profile_picture,
        role: userData.role,
        is_active: userData.is_active,
        status_id: userData.status_id,
        created_at: userData.created_at,
        firebase_uid: firebaseUser.uid
      }
    } catch (error) {
      console.error('❌ Error getting current user:', error)
      return null
    }
  }

  // Get Firebase ID token for API authentication
  static async getIdToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        return null
      }
      
      const token = await currentUser.getIdToken()
      return token
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  }

  // Sync Firebase user to Supabase database
  static async syncUserToSupabase(firebaseUser: FirebaseUser): Promise<AuthUser> {
    try {
      console.log('📝 Syncing Firebase user to Supabase:', firebaseUser.email)
      
      // Step 1: Get the "Active" status ID
      const { data: statusData, error: statusError } = await supabase
        .from('dim_status')
        .select('status_id')
        .eq('status_name', 'Active')
        .single()

      if (statusError) {
        console.error('❌ Error fetching Active status:', statusError)
        throw new Error('Could not find Active status in database')
      }

      console.log('✅ Found Active status:', statusData)
      
      // Step 2: Check if user already exists by email (not Firebase UID)
      const { data: existingUser } = await supabase
        .from('dim_user')
        .select('*')
        .eq('email', firebaseUser.email)
        .single()

      if (existingUser) {
        console.log('👤 User already exists, updating status to Active')
        
        // Update existing user status to active
        const { data, error } = await supabase
          .from('dim_user')
          .update({
            status_id: statusData.status_id,
            updated_at: new Date().toISOString()
          })
          .eq('email', firebaseUser.email)
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating existing user:', error)
          throw error
        }

        return {
          user_id: data.user_id,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          profile_picture: data.profile_picture,
          role: data.role,
          is_active: data.is_active,
          status_id: data.status_id,
          created_at: data.created_at,
          firebase_uid: firebaseUser.uid
        }
      }

      // Step 3: Create new user with auto-generated UUID
      console.log('🆕 Creating new user with generated UUID')
      
      const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
      const [firstName, ...lastNameParts] = displayName.split(' ')
      const lastName = lastNameParts.join(' ') || ''
      
      const newUserData = {
        user_id: uuidv4(), // Generate our own UUID
        username: firebaseUser.email?.split('@')[0] || 'user',
        email: firebaseUser.email || '',
        password_hash: 'firebase_auth', // Mark as Firebase auth
        first_name: firstName,
        last_name: lastName,
        profile_picture: firebaseUser.photoURL || '',
        role: 'citizen' as const,
        is_active: true,
        status_id: statusData.status_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📋 Creating user with data:', JSON.stringify(newUserData, null, 2))

      const { data, error } = await supabase
        .from('dim_user')
        .insert([newUserData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating new user:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        console.error('❌ Error code:', error.code)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error hint:', error.hint)
        throw error
      }

      console.log('✅ User created successfully in Supabase')

      return {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_picture: data.profile_picture,
        role: data.role,
        is_active: data.is_active,
        status_id: data.status_id,
        created_at: data.created_at,
        firebase_uid: firebaseUser.uid
      }
    } catch (error) {
      console.error('❌ Error in syncUserToSupabase:', error)
      throw error
    }
  }

  // Update user status in Supabase
  static async updateUserStatus(userId: string, statusId: string) {
    try {
      const { error } = await supabase
        .from('dim_user')
        .update({ status_id: statusId })
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error updating user status:', error)
        throw error
      }

      console.log('✅ User status updated successfully')
    } catch (error) {
      console.error('❌ Error in updateUserStatus:', error)
      throw error
    }
  }

  // Listen to Firebase auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Firebase auth state changed:', firebaseUser?.email || 'signed out')
      
      if (firebaseUser) {
        // User signed in - sync to Supabase and get user data
        const user = await this.syncUserToSupabase(firebaseUser)
        callback(user)
      } else {
        // User signed out
        callback(null)
      }
    })
  }
}
