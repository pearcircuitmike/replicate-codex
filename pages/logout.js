import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import MetaTags from "../components/MetaTags";

const LogoutPage = () => {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      console.log("Logging out...");
      await logout();
      router.push("/");
    };

    handleLogout();
  }, [logout, router]);

  return (
    <>
      <MetaTags
        title="Logging Out"
        description="Logging out of your AIModels.fyi account"
        socialPreviewTitle="Logout - AIModels.fyi"
        socialPreviewSubtitle="See you again soon"
      />
    </>
  );
};

export default LogoutPage;
