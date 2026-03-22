import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  institution: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userMetadata = null) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, institutions(*)')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('Profile fetch error, using metadata fallback:', profileError);
        // Fallback to user_metadata if profile fetch fails
        if (userMetadata) {
          setProfile({
            id: userId,
            first_name: userMetadata.first_name,
            last_name: userMetadata.last_name,
            role: userMetadata.role,
            institution_id: userMetadata.institution_id,
            programme: userMetadata.programme,
            year_of_study: userMetadata.year_of_study,
            student_number: userMetadata.student_number
          });
        }
        return;
      }
      
      setProfile(profileData);
      setInstitution(profileData.institutions);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Final fallback
      if (userMetadata) {
        setProfile({
          id: userId,
          first_name: userMetadata.first_name,
          last_name: userMetadata.last_name,
          role: userMetadata.role
        });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.user_metadata);
      }
      if (isMounted) setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.user_metadata);
      } else {
        setProfile(null);
        setInstitution(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setInstitution(null);
  };

  const value = {
    user,
    profile,
    institution,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
