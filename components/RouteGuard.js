import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const protectedRoutes = ["/account", "/dashboard"];

const RouteGuard = ({ children }) => {
  const { user, loading, hasActiveSubscription } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserRequirements = async () => {
      if (loading) return;

      if (!protectedRoutes.some((route) => router.pathname.startsWith(route))) {
        return;
      }

      // 1. Check if user is logged in
      if (!user) {
        console.log("Unauthorized access detected, redirecting to /login.");
        await router.push("/login");
        return;
      }

      // 2. Get user profile with all onboarding flags
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("topics_onboarded, roles_onboarded, frequency_onboarded")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error checking user profile:", profileError);
        return;
      }

      // 3. Check roles onboarding (first step)
      if (!userProfile?.roles_onboarded) {
        console.log(
          "User hasn't completed roles onboarding, redirecting to /onboarding/roles"
        );
        await router.push("/onboarding/roles");
        return;
      }

      // 4. Check topics onboarding (second step)
      if (!userProfile?.topics_onboarded) {
        console.log(
          "User hasn't completed topics onboarding, redirecting to /onboarding/topics"
        );
        await router.push("/onboarding/topics");
        return;
      }

      // 5. Check frequency onboarding (third step)
      if (!userProfile?.frequency_onboarded) {
        console.log(
          "User hasn't completed frequency onboarding, redirecting to /onboarding/frequency"
        );
        await router.push("/onboarding/frequency");
        return;
      }

      // 6. Check subscription status for dashboard access
      if (!hasActiveSubscription && router.pathname.startsWith("/dashboard")) {
        console.log("User lacks active subscription, redirecting to /pricing.");
        await router.push("/pricing");
        return;
      }
    };

    checkUserRequirements().catch((error) => {
      console.error("Error in route guard:", error);
    });
  }, [user, hasActiveSubscription, loading, router]);

  return <>{children}</>;
};

export default RouteGuard;
