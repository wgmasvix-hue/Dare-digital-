import { useState } from 'react';

export interface User {
  email: string;
  id: string;
  role: string;
}

export interface Profile {
  first_name: string;
  role: string;
}

export interface Institution {
  institution_name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        return {
          first_name: parsedUser.email?.split('@')[0] || 'User',
          role: parsedUser.role || 'student',
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  const [institution, setInstitution] = useState<Institution | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? { institution_name: 'University of Zimbabwe' } : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;
  const loading = false;

  const signIn = (email: string) => {
    // Mock sign in
    const mockUser: User = { email, id: '123', role: 'student' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setProfile({ first_name: email.split('@')[0], role: 'student' });
    setInstitution({ institution_name: 'University of Zimbabwe' });
  };

  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    setInstitution(null);
  };

  return {
    user,
    profile,
    institution,
    loading,
    isAuthenticated,
    signIn,
    signOut,
  };
};
