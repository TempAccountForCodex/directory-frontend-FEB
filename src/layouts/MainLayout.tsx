import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Box } from "@mui/material";
import ScrollToTop from "../components/ScrollToTop";
import MoveUpButton from "../components/UI/MoveUpBtn";

export default function MainLayout() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Top navigation */}
      <Navbar />

      {/* Main content */}
      <Box component="main" flexGrow={1} p={0}>
        <Outlet />
      </Box>
      <ScrollToTop />
      <MoveUpButton />
      {/* Footer */}
      <Footer />
    </Box>
  );
}
