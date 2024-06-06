import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const protectedRoutes = ["/dashboard", "/welcome", "/account"];

const RouteGuard = ({ children }) => {
  const { user, loading, firstTimeUser, hasActiveSubscription } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (protectedRoutes.includes(router.pathname)) {
          console.log("Unauthorized access detected, redirecting to /login.");
          router.push("/login");
        }
      } else {
        if (
          protectedRoutes.includes(router.pathname) &&
          !hasActiveSubscription
        ) {
          console.log(
            "User does not have an active subscription, redirecting to /pricing."
          );
          router.push("/pricing");
        } else if (firstTimeUser && hasActiveSubscription) {
          console.log(
            "First time user with active subscription, redirecting to /welcome."
          );
          router.push("/welcome");
        } else if (!firstTimeUser && router.pathname === "/welcome") {
          console.log(
            "Not a first time user anymore, redirecting to /dashboard."
          );
          router.push("/dashboard");
        }
      }
    }
  }, [user, firstTimeUser, hasActiveSubscription, loading, router.pathname]);

  return <>{children}</>;
};

export default RouteGuard;
