import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const router = useRouter();
  const isPricingPage = router.pathname === "/pricing";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {!isPricingPage && <Navbar />}
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
      {!isPricingPage && (
        <Footer style={{ padding: "1rem", borderTop: "1px solid #ccc" }} />
      )}
    </div>
  );
};

export default Layout;
