import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const WhiteLogo = "/WhiteLogo.png";

const tabs = [
  { label: "Listings", path: "/listings" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
];

function Navbar() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const activePath = useMemo(() => {
    if (location.pathname.startsWith("/listings/")) return "/listings";
    return location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  if (
    location.pathname === "/dashboard" ||
    /^\/business\//.test(location.pathname) ||
    isDashboardRoute
  ) {
    return null;
  }

  const handleSignIn = () => {
    navigate(auth.user ? "/dashboard" : "/auth");
  };

  const onNavClick = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          background: scrolled ? "#0b0f10" : "transparent",
          transition: "background-color 0.35s ease",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
            className="nav-mobile-btn"
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>☰</span>
          </button>

          <Link to="/" style={{ display: "inline-flex", justifySelf: "start" }}>
            <img
              src={WhiteLogo}
              alt="logo"
              width={180}
              height={30}
              style={{ width: "clamp(145px, 15vw, 180px)", height: "auto" }}
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          <nav className="nav-desktop" aria-label="Main navigation">
            {tabs.map((item) => {
              const isActive = activePath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavClick(item.path)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: isActive ? "#47aab6" : "#fff",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 400,
                    letterSpacing: "0.3px",
                    padding: "8px 6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleSignIn}
              style={{
                marginLeft: 18,
                border: "none",
                borderRadius: 999,
                padding: "12px 24px",
                background: "#fff",
                color: "#000",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.56)",
              backdropFilter: "blur(4px)",
              border: "none",
              zIndex: 350,
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "min(88vw, 350px)",
              height: "100vh",
              zIndex: 360,
              background: "#000",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
              }}
            >
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img
                  src={WhiteLogo}
                  alt="logo"
                  width={180}
                  height={30}
                  style={{ width: 170, height: "auto" }}
                  decoding="async"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 30,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "10px 14px", display: "grid", gap: 4 }}>
              {tabs.map((item) => {
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavClick(item.path)}
                    style={{
                      border: "none",
                      textAlign: "left",
                      padding: "12px 10px",
                      borderRadius: 10,
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                      color: "#fff",
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "auto", padding: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignIn();
                }}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 8,
                  background: "#3d8a95",
                  color: "#fff",
                  padding: "12px 14px",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                {auth.user ? "Dashboard" : "Sign In"}
              </button>
            </div>
          </aside>
        </>
      )}

      <style>{`
        .nav-desktop { display: none; }
        @media (min-width: 900px) {
          .nav-mobile-btn { display: none !important; }
          .nav-desktop {
            display: flex;
            align-items: center;
            justify-self: end;
            gap: 14px;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
