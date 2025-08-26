import { supabase } from '@/lib/database/client';
import { NextRequest } from 'next/server';

export interface AuthUser {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
    role: 'admin' | 'user';
    created_at: string;
    updated_at: string;
}

export interface AuthResult {
    user: AuthUser | null;
    error: string | null;
}

// Simplified authentication for development - bypasses Firebase token verification
export const authenticateUser = async (request: NextRequest): Promise<AuthResult> => {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { user: null, error: 'No authorization token provided' };
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // For development, we'll decode the email from the token without verification
        // In production, you would verify the Firebase JWT token here
        let userEmail: string;
        try {
            // Simple token parsing - in production you'd verify the Firebase JWT
            const payload = JSON.parse(atob(token.split('.')[1]));
            userEmail = payload.email;
        } catch (error) {
            return { user: null, error: 'Invalid token format' };
        }

        // Fetch user from Supabase using email
        const { data: userData, error: userError } = await supabase
            .from('dim_user')
            .select('*')
            .eq('email', userEmail)
            .single();

        if (userError || !userData) {
            return { user: null, error: 'User not found' };
        }

        const user: AuthUser = {
            user_id: userData.user_id,
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            profile_picture: userData.profile_picture,
            role: userData.role || 'user',
            created_at: userData.created_at,
            updated_at: userData.updated_at
        };

        return { user, error: null };

    } catch (error) {
        console.error('Authentication error:', error);
        return { user: null, error: 'Authentication failed' };
    }
};

// Simple admin check
export const requireAdmin = (authResult: AuthResult): boolean => {
    return authResult.user?.role === 'admin';
};
