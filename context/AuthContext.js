import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../pages/api/utils/supabaseClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    loading: true,
    firstTimeUser: false,
    hasActiveSubscription: false,
  });

  const setUser = (user) => setState((prev) => ({ ...prev, user }));
  const setLoading = (loading) => setState((prev) => ({ ...prev, loading }));
  const setFirstTimeUser = (firstTimeUser) =>
    setState((prev) => ({ ...prev, firstTimeUser }));
  const setHasActiveSubscription = (hasActiveSubscription) =>
    setState((prev) => ({ ...prev, hasActiveSubscription }));

  useEffect(() => {
    const getUserAndCheckStatus = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (sessionData.session) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("first_login, stripe_subscription_status")
            .eq("id", sessionData.session.user.id)
            .single();

          if (profileError) throw profileError;

          setState({
            user: sessionData.session.user,
            loading: false,
            firstTimeUser: profileData?.first_login || false,
            hasActiveSubscription:
              profileData?.stripe_subscription_status === "active" ||
              profileData?.stripe_subscription_status === "substack",
          });
        } else {
          setState({
            user: null,
            loading: false,
            firstTimeUser: false,
            hasActiveSubscription: false,
          });
        }
      } catch (error) {
        console.error("Error in getUserAndCheckStatus:", error);
        setState({
          user: null,
          loading: false,
          firstTimeUser: false,
          hasActiveSubscription: false,
        });
      }
    };

    getUserAndCheckStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session.user);
          // You may want to fetch profile data here as well
        } else if (event === "SIGNED_OUT") {
          setState({
            user: null,
            loading: false,
            firstTimeUser: false,
            hasActiveSubscription: false,
          });
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
        ...state,
        logout,
        setUser,
        setLoading,
        setFirstTimeUser,
        setHasActiveSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
