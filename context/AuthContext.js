import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../utils/supabaseClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUserAndCheckFirstLogin = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionData.session) {
        setUser(sessionData.session.user);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_login")
          .eq("id", sessionData.session.user.id)
          .single();

        if (profileData && !profileError) {
          setFirstTimeUser(profileData.first_login);
        }
      } else {
        setUser(null);
        setFirstTimeUser(false);
      }
      setLoading(false);
    };

    getUserAndCheckFirstLogin();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setFirstTimeUser(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Handles all routing based on authentication and user's first-time status
    if (!loading) {
      if (!user) {
        if (
          router.pathname === "/welcome" ||
          router.pathname === "/dashboard"
        ) {
          console.log("Unauthorized access detected, redirecting to /login.");
          router.push("/login");
        }
      } else {
        if (firstTimeUser && router.pathname !== "/welcome") {
          console.log("First time user detected, redirecting to /welcome.");
          router.push("/welcome");
        } else if (!firstTimeUser && router.pathname === "/welcome") {
          console.log(
            "Not a first time user anymore, redirecting to /dashboard."
          );
          router.push("/dashboard");
        }
      }
    }
  }, [user, firstTimeUser, loading, router.pathname]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
