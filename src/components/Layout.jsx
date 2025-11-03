import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "sonner"; // ใช้ sonner เป็น toast notification
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isHomePage ? "bg-[#fdf6ec]" : "bg-[#fdf6ea]"
      }`}
    >
      {/* Navbar ด้านบน */}
      <Navbar />

      {/* ทำให้ทุกครั้งที่เปลี่ยนหน้า Scroll กลับขึ้นบนสุด */}
      <ScrollToTop />

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer ด้านล่าง */}
      <Footer />

      {/* Global Toaster (แจ้งเตือน) */}
      <Toaster
        position="top-right"
        // richColors
        toastOptions={{
          success: {
            style: {
              background: "#fdf6ec",
              color: "black",
            },
          },
          error: {
            style: {
              background: "#DC2626",
              color: "#fdf6ec",
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;
