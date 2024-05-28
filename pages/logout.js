// pages/logout.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

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

  return null;
};

export default LogoutPage;
