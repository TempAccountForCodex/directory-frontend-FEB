import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const WhiteLogo = "/WhiteLogo.png";

const tabs = [
  { label: "Templates", path: "/templates" },
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
          height: 70,
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
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Col 1: hamburger (mobile) | logo (desktop) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Hamburger — mobile only */}
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

            {/* Logo — desktop left */}
            <Link
              to="/"
              className="nav-logo-desktop"
              style={{ display: "none" }}
            >
              <img
                src={WhiteLogo}
                alt="logo"
                style={{ width: "clamp(145px, 15vw, 180px)", height: "auto" }}
                fetchPriority="high"
                decoding="async"
              />
            </Link>
          </div>

          {/* Col 2: logo center (mobile) | nav links center (desktop) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Logo — mobile center */}
            <Link
              to="/"
              className="nav-logo-mobile"
              style={{ display: "inline-flex" }}
            >
              <img
                src={WhiteLogo}
                alt="logo"
                style={{ width: "clamp(145px, 15vw, 180px)", height: "auto" }}
                fetchPriority="high"
                decoding="async"
              />
            </Link>

            {/* Nav links — desktop center */}
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
            </nav>
          </div>

          {/* Col 3: CTA button right (desktop only) */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSignIn}
              className="nav-cta"
              style={{
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
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              border: "none",
              zIndex: 350,
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "min(85vw, 320px)",
              height: "100vh",
              zIndex: 360,
              background:
                "linear-gradient(160deg, #0d1117 0%, #0f1e22 60%, #0a1a1f 100%)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Decorative glow orbs */}
            <div
              style={{
                position: "absolute",
                top: -60,
                left: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(71,170,182,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 80,
                right: -80,
                width: 250,
                height: 250,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(71,170,182,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 20px 16px",
                borderBottom: "1px solid rgba(71,170,182,0.15)",
                position: "relative",
              }}
            >
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img
                  src={WhiteLogo}
                  alt="logo"
                  style={{ width: 150, height: "auto" }}
                  decoding="async"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  fontSize: 18,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Nav items */}
            <div
              style={{
                padding: "20px 0 0",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {tabs.map((item, i) => {
                const isActive = activePath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => onNavClick(item.path)}
                    style={{
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      textAlign: "left",
                      padding: "18px 24px",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {/* Left: number + label */}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? "#47aab6" : "rgba(255,255,255,0.2)",
                          letterSpacing: "0.08em",
                          minWidth: 20,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                          letterSpacing: "-0.3px",
                          lineHeight: 1,
                        }}
                      >
                        {item.label}
                      </span>
                    </span>

                    {/* Right: arrow */}
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: isActive
                          ? "1px solid #47aab6"
                          : "1px solid rgba(255,255,255,0.1)",
                        background: isActive
                          ? "rgba(71,170,182,0.15)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: isActive ? "#47aab6" : "rgba(255,255,255,0.3)",
                        fontSize: 14,
                      }}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div
              style={{
                marginTop: "auto",
                padding: "20px 16px",
                position: "relative",
              }}
            >
              {/* Thin divider */}
              <div
                style={{
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, rgba(71,170,182,0.3), transparent)",
                  marginBottom: 20,
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignIn();
                }}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #47aab6 0%, #2d7a85 100%)",
                  color: "#fff",
                  padding: "15px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 4px 24px rgba(71,170,182,0.3)",
                }}
              >
                {auth.user ? "Go to Dashboard" : "Get Started →"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 12,
                  marginBottom: 0,
                }}
              >
                No credit card required
              </p>
            </div>
          </aside>
        </>
      )}

      <style>{`
        /* Mobile defaults */
        .nav-desktop { display: none; }
        .nav-cta { display: none; }
        .nav-logo-desktop { display: none !important; }
        .nav-logo-mobile { display: inline-flex; }

        /* Desktop (≥900px): logo left, nav center, CTA right */
        @media (min-width: 900px) {
          .nav-mobile-btn { display: none !important; }
          .nav-logo-mobile { display: none !important; }
          .nav-logo-desktop { display: inline-flex !important; }
          .nav-desktop {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .nav-cta { display: inline-flex; }
        }
      `}</style>
    </>
  );
}

export default Navbar;
