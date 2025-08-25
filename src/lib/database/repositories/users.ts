import { supabase, handleSupabaseError } from '../client';
import { User } from '../types';
import { DecodedIdToken } from 'firebase-admin/auth';

export class UsersRepository {
    
    // Get user by email
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            console.log(`📍 Fetching user with email: ${email}`);

            const { data, error } = await supabase
                .from('dim_user')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`ℹ️ User with email ${email} not found`);
                    return null;
                }
                throw error;
            }

            if (!data) {
                return null;
            }

            console.log(`✅ Successfully fetched user: ${data.username}`);
            return data as User;

        } catch (error) {
            console.error(`❌ Error fetching user ${email}:`, error);
            const errorDetails = handleSupabaseError(error, 'getUserByEmail');
            throw new Error(errorDetails.error);
        }
    }

    // Get user by ID
    async getUserById(userId: string): Promise<User | null> {
        try {
            console.log(`📍 Fetching user with ID: ${userId}`);

            const { data, error } = await supabase
                .from('dim_user')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log(`ℹ️ User with ID ${userId} not found`);
                    return null;
                }
                throw error;
            }

            if (!data) {
                return null;
            }

            console.log(`✅ Successfully fetched user: ${data.username}`);
            return data as User;

        } catch (error) {
            console.error(`❌ Error fetching user ${userId}:`, error);
            const errorDetails = handleSupabaseError(error, 'getUserById');
            throw new Error(errorDetails.error);
        }
    }

    // Create new user from Firebase auth
    async createUserFromFirebase(firebaseUser: DecodedIdToken): Promise<User> {
        try {
            console.log(`📍 Creating new user from Firebase: ${firebaseUser.email}`);

            // Get active status_id first
            const { data: statusData, error: statusError } = await supabase
                .from('dim_status')
                .select('status_id')
                .eq('status_name', 'Active')
                .single();

            if (statusError) {
                throw statusError;
            }

            // Create new user
            const { data: newUserData, error: insertError } = await supabase
                .from('dim_user')
                .insert({
                    username: firebaseUser.email?.split('@')[0] || 'user',
                    email: firebaseUser.email,
                    password_hash: 'firebase_auth',
                    first_name: firebaseUser.name?.split(' ')[0] || 'User',
                    last_name: firebaseUser.name?.split(' ').slice(1).join(' ') || '',
                    profile_picture: firebaseUser.picture || null,
                    role: 'citizen',
                    is_active: true,
                    status_id: statusData.status_id
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            console.log(`✅ Successfully created user: ${newUserData.username}`);
            return newUserData as User;

        } catch (error) {
            console.error(`❌ Error creating user from Firebase:`, error);
            const errorDetails = handleSupabaseError(error, 'createUserFromFirebase');
            throw new Error(errorDetails.error);
        }
    }

    // Get or create user (for auth flow)
    async getOrCreateUser(firebaseUser: DecodedIdToken): Promise<User> {
        try {
            // Try to get existing user first
            const existingUser = await this.getUserByEmail(firebaseUser.email!);
            
            if (existingUser) {
                return existingUser;
            }

            // Create new user if doesn't exist
            return await this.createUserFromFirebase(firebaseUser);

        } catch (error) {
            console.error('❌ Error in getOrCreateUser:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const usersRepository = new UsersRepository();
