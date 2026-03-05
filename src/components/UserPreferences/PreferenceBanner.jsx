import React from "react";
import { useCookieConsent } from "../../context/PreferencesContext";

const bannerStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: "rgba(0, 0, 0, 0.95)",
  borderTop: "1px solid rgba(55, 140, 146, 0.3)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
  padding: "14px 16px",
};

const rowStyle = {
  maxWidth: 1280,
  margin: "0 auto",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
  justifyContent: "space-between",
};

const textWrapStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  flex: "1 1 500px",
  minWidth: 0,
};

const titleStyle = {
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1.2,
  margin: 0,
};

const bodyStyle = {
  color: "rgba(255,255,255,0.85)",
  fontSize: 14,
  lineHeight: 1.45,
  margin: "4px 0 0",
};

const buttonsStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  flex: "0 1 auto",
};

function makeBtn(base) {
  return {
    borderRadius: 8,
    padding: "9px 14px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid transparent",
    background: "transparent",
    ...base,
  };
}

export default function CookieBanner() {
  const {
    showBanner,
    handleAcceptAll,
    handleRejectNonEssential,
    openPreferences,
  } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div style={bannerStyle} role="dialog" aria-label="Cookie consent banner">
      <div style={rowStyle}>
        <div style={textWrapStyle}>
          <div style={{ color: "#378C92", fontSize: 20, lineHeight: 1 }}>🍪</div>
          <div>
            <p style={titleStyle}>We value your privacy</p>
            <p style={bodyStyle}>
              We use cookies to improve experience and analyze traffic. See{" "}
              <a
                href="/cookie-policy"
                style={{ color: "#52b5bf", textDecoration: "underline" }}
              >
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </div>

        <div style={buttonsStyle}>
          <button
            type="button"
            onClick={handleRejectNonEssential}
            style={makeBtn({
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            })}
          >
            Reject
          </button>
          <button
            type="button"
            onClick={openPreferences}
            style={makeBtn({
              color: "#52b5bf",
              borderColor: "#378C92",
            })}
          >
            Customize
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            style={makeBtn({
              color: "#fff",
              background: "#378C92",
              borderColor: "#378C92",
            })}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
