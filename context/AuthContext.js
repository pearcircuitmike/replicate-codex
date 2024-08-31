import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../pages/api/utils/supabaseClient";
import { trackEvent } from "../pages/api/utils/analytics-util";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true, // Start with loading true to indicate we're checking the session
    hasActiveSubscription: false,
  });

  const handleSession = async (session) => {
    if (session) {
      const { user } = session;
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("stripe_subscription_status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        setState({ user: null, loading: false, hasActiveSubscription: false });
        return;
      }

      const hasActiveSubscription =
        profileData?.stripe_subscription_status === "active" ||
        profileData?.stripe_subscription_status === "trialing" ||
        profileData?.stripe_subscription_status === "substack";

      setState({
        user,
        loading: false,
        hasActiveSubscription,
      });

      trackEvent("login");
    } else {
      setState({
        user: null,
        loading: false,
        hasActiveSubscription: false,
      });
    }
  };

  useEffect(() => {
    const getUserAndCheckStatus = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }
      handleSession(sessionData.session);
    };

    getUserAndCheckStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      trackEvent("logout");
      setState({
        user: null,
        loading: false,
        hasActiveSubscription: false,
      });
    }
  };

  const handleSignInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/dashboard`,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignInWithEmail = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/dashboard`,
      },
    });
    if (error) {
      console.error("Error signing in with email:", error);
    }
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        logout,
        handleSignInWithGoogle,
        handleSignInWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
