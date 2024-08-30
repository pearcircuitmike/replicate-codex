import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const protectedRoutes = ["/welcome", "/account", "/trending"];

const RouteGuard = ({ children }) => {
  const { user, loading, firstTimeUser, hasActiveSubscription } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (
        router.pathname.startsWith("/dashboard") ||
        protectedRoutes.includes(router.pathname)
      ) {
        console.log("Unauthorized access detected, redirecting to /login.");
        router.push("/login").catch((error) => {
          console.error("Redirect to login failed:", error);
        });
      }
    } else {
      if (
        (router.pathname.startsWith("/dashboard") ||
          protectedRoutes.includes(router.pathname)) &&
        !hasActiveSubscription
      ) {
        console.log("User lacks active subscription, redirecting to /pricing.");
        router.push("/pricing").catch((error) => {
          console.error("Redirect to pricing failed:", error);
        });
      } else if (
        firstTimeUser &&
        hasActiveSubscription &&
        router.pathname !== "/welcome"
      ) {
        console.log(
          "First-time user with active subscription, redirecting to /welcome."
        );
        router.push("/welcome").catch((error) => {
          console.error("Redirect to welcome failed:", error);
        });
      } else if (!firstTimeUser && router.pathname === "/welcome") {
        console.log("Returning user, redirecting to /dashboard.");
        router.push("/dashboard").catch((error) => {
          console.error("Redirect to dashboard failed:", error);
        });
      }
    }
  }, [user, firstTimeUser, hasActiveSubscription, loading, router]);

  return <>{children}</>;
};

export default RouteGuard;
