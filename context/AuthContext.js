// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/pages/api/utils/supabaseClient";
import { trackEvent } from "../pages/api/utils/analytics-util";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    hasActiveSubscription: false,
    accessToken: null,
  });

  // Grabs user data from session, fetches subscription status
  const handleSession = async (session) => {
    if (!session) {
      setState({
        user: null,
        loading: false,
        hasActiveSubscription: false,
        accessToken: null,
      });
      return;
    }

    const { user } = session;

    // Fetch subscription status
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_status, signup_source")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      setState({
        user: null,
        loading: false,
        hasActiveSubscription: false,
        accessToken: null,
      });
      return;
    }

    const hasActiveSubscription =
      profileData?.stripe_subscription_status === "active" ||
      profileData?.stripe_subscription_status === "trialing" ||
      profileData?.stripe_subscription_status === "substack";

    // Store the user in our React state
    setState({
      user,
      loading: false,
      hasActiveSubscription,
      accessToken: session.access_token,
    });

    // If the user doesn't have signup_source in the DB,
    // and localStorage has it, update it now.
    const localSignupSource =
      typeof window !== "undefined" && localStorage.getItem("signupSource");

    if (!profileData?.signup_source && localSignupSource) {
      // Attempt to set signup source in DB
      try {
        const response = await fetch("/api/onboarding/update-signup-source", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            signupSource: localSignupSource,
          }),
        });

        // If updated or already set, remove localStorage so we don't retry
        if (response.ok || response.status === 409) {
          localStorage.removeItem("signupSource");
        } else {
          const errorData = await response.json();
          console.error("Failed to update signup source:", errorData);
        }
      } catch (error) {
        console.error("Error calling update-signup-source API:", error);
      }
    } else if (profileData?.signup_source && localSignupSource) {
      // If the DB *already* has signup_source,
      // remove localStorage to avoid repeated calls
      localStorage.removeItem("signupSource");
    }
  };

  useEffect(() => {
    // 1. On first load, check if we already have a session
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

    // 2. Subscribe to changes like SIGNED_IN, SIGNED_OUT, TOKEN_REFRESH
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          // We only track login once per real sign-in
          trackEvent("login");
        }
        // Then we always update our local state
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
        accessToken: null,
      });
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/dashboard`,
        },
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignInWithEmail = async (email) => {
    try {
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
    } catch (error) {
      console.error("Error with signInWithEmail:", error);
      return { data: null, error };
    }
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
