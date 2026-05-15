// @ts-nocheck
import type { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Blog from "../pages/Blog";
import Home from "../pages/Home";
// import About from "../pages/About"; // TODO: Create About page
import Contact from "../pages/Contact";
import Listings from "../pages/Listings";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import BlogDetail from "../pages/BlogDetail";
import ListingDetails from "../pages/ListingDetail";
import ListingComapanyDetails from "../pages/ListingCompanyDetails";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      // TODO: Create About page - { path: "/about-us", element: <About /> },
      { path: "/listings", element: <Listings /> },
      { path: "/listings/:id", element: <ListingDetails /> },
      { path: "/business/:slug", element: <ListingComapanyDetails /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:id", element: <BlogDetail /> },
      { path: "/contact", element: <Contact /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/*", element: <NotFound /> },
    ],
  },
];

export default routes;
