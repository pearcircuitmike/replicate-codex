import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const getUserAndCheckStatus = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionData.session) {
        setUser(sessionData.session.user);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_login, stripe_subscription_status")
          .eq("id", sessionData.session.user.id)
          .single();

        if (profileData && !profileError) {
          setFirstTimeUser(profileData.first_login);
          setHasActiveSubscription(
            profileData.stripe_subscription_status === "active"
          );
        }
      } else {
        setUser(null);
        setFirstTimeUser(false);
        setHasActiveSubscription(false);
      }
      setLoading(false);
    };

    getUserAndCheckStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setFirstTimeUser(false);
          setHasActiveSubscription(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        firstTimeUser,
        setFirstTimeUser,
        hasActiveSubscription,
        setHasActiveSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
