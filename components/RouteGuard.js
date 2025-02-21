// /components/RouteGuard.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import supabase from "@/pages/api/utils/supabaseClient";

const protectedRoutes = ["/account", "/dashboard"];

export default function RouteGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserRequirements = async () => {
      if (loading) return;

      // Only guard certain routes
      if (!protectedRoutes.some((route) => router.pathname.startsWith(route))) {
        return;
      }

      // Must be logged in
      if (!user) {
        console.log("Not logged in, redirecting to /login.");
        await router.push("/login");
        return;
      }

      // Fetch the user's profile
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("inbox_onboarded, communities_onboarded, frequency_onboarded")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return;
      }

      // Communities step
      if (!userProfile.communities_onboarded) {
        console.log("Redirecting to /onboarding/communities");
        await router.push("/onboarding/communities");
        return;
      }

      // Frequency step
      if (!userProfile.frequency_onboarded) {
        console.log("Redirecting to /onboarding/frequency");
        await router.push("/onboarding/frequency");
        return;
      }
    };

    checkUserRequirements().catch((error) => {
      console.error("Error in route guard:", error);
    });
  }, [user, loading, router]);

  return <>{children}</>;
}
