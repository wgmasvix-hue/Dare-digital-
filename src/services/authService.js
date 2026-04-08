import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up with email and password
  async signUp(email, password, fullName, role = 'student') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  },

  // Reset password (send reset email)
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  // Update password (after reset or in account settings)
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  },

  // Check if user is admin
  async isAdmin() {
    try {
      const result = await supabase.rpc('is_admin');
      return result.data || false;
    } catch (err) {
      console.error('Error checking admin:', err);
      return false;
    }
  },

  // Get user role
  async getUserRole() {
    try {
      const { data, error } = await supabase.rpc('get_user_role');
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting role:', err);
      return null;
    }
  }
};
