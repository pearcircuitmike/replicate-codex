import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
      <Footer style={{ padding: "1rem", borderTop: "1px solid #ccc" }} />
    </div>
  );
};

export default Layout;
