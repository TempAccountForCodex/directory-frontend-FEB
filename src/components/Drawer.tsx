import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  useTheme,
} from "@mui/material";
import { Login, Input, Logout, Dashboard } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { Link, useLocation } from "react-router-dom";
import header_scrolled from "/assets/images/header/WhiteLogo.png";
import { useAuth } from "../context/AuthContext";

console.log("header_scrolled", header_scrolled);

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface DrawerItemsProps {
  tab: NavItem[];
  handleDrawerToggle: () => void;
}

const DrawerItems: React.FC<DrawerItemsProps> = ({
  tab,
  handleDrawerToggle,
}) => {
  const [userExists, setUserExists] = useState(false);
  const auth = useAuth();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setUserExists(!!user);
  }, []);

  const drawerTab: NavItem[] = [
    // {
    //   label: "Login",
    //   path: "/auth?mode=login",
    //   icon: <Login />,
    // },
    // {
    //   label: "Register",
    //   path: "/auth?mode=signup",
    //   icon: <Input />,
    // },
  ];

  const logoutTab: NavItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <Dashboard />,
    },
    {
      label: "Logout",
      path: "#",
      icon: <Logout />,
      onClick: async () => {
        await auth.signout();
        handleDrawerToggle();
        window.location.href = "/auth?mode=login";
      },
    },
  ];

  if (userExists) {
    drawerTab.pop();
  }

  const finalTab: NavItem[] = auth.user
    ? [...tab, ...logoutTab]
    : [...tab, ...drawerTab];

  return (
    <>
      {/* Top logo & close button */}
      <Toolbar>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          position={"relative"}
          zIndex={301}
        >
          <Stack direction="row">
            <Link style={{ textDecoration: "none" }} to="/">
              <IconButton sx={{ p: 0 }} size="large">
                <Box
                  component="img"
                  src={header_scrolled}
                  alt="logo"
                  sx={{
                    width: { xs: "180px", md: "180px" },
                    height: "auto",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                  }}
                />
              </IconButton>
            </Link>
          </Stack>
          <Stack mt={0.6} mr={{ xs: -2, sm: -3 }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleDrawerToggle}
            >
              <Close sx={{ color: "white" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Toolbar>

      {/* <Divider color="gainsboro" /> */}

      {/* Navigation List */}
      <List sx={{ py: 0, mt: 2 }}>
        {finalTab.map((data, index) => {
          const isActive = location.pathname === data.path;

          return (
            <ListItem
              disablePadding
              key={index}
              component={data.path.startsWith("http") ? "a" : Link}
              to={data.path.startsWith("http") ? undefined : data.path}
              href={data.path.startsWith("http") ? data.path : undefined}
              target={data.path.startsWith("http") ? "_blank" : undefined}
              rel={
                data.path.startsWith("http") ? "noopener noreferrer" : undefined
              }
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: isActive
                  ? "rgb(255 255 255 / .06)"
                  : "inherit",
                transition: "all 0.2s ease-in-out",
                padding: "0px 25px",
                "&:hover": {
                  backgroundColor: isActive
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                },
              }}
              onClick={data.onClick ? data.onClick : handleDrawerToggle}
            >
              <ListItemButton>
                {/* <ListItemIcon
                  sx={{
                    color: isActive
                      ? (theme.palette.primary as any).focus
                      : theme.palette.text.primary,
                  }}
                >
                  {data.icon}
                </ListItemIcon> */}
                <ListItemText
                  sx={{ ml: -2 }}
                  primaryTypographyProps={{
                    fontSize: 20,
                    fontWeight: "smart",
                  }}
                  primary={data.label}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default DrawerItems;
