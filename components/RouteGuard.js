import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const protectedRoutes = ["/account", "/trending", "/dashboard"];

const RouteGuard = ({ children }) => {
  const { user, loading, hasActiveSubscription } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (protectedRoutes.includes(router.pathname)) {
        console.log("Unauthorized access detected, redirecting to /login.");
        router.push("/login").catch((error) => {
          console.error("Redirect to login failed:", error);
        });
      }
    } else if (
      !hasActiveSubscription &&
      router.pathname.startsWith("/dashboard")
    ) {
      console.log("User lacks active subscription, redirecting to /pricing.");
      router.push("/pricing").catch((error) => {
        console.error("Redirect to pricing failed:", error);
      });
    }
  }, [user, hasActiveSubscription, loading, router]);

  return <>{children}</>;
};

export default RouteGuard;
