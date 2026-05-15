import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    bg: {
      hero: string;
      section: string;
      muted: string;
      dark: string;
      blackBg: string;
      gray: string;
      main: string;
      gradient: string;
      cardIconBg: string;
    };
    chatbot: {
      sidebar: string;
      chatBox: string;
    };
    darkcard: {
      main: string;
      contrastText: string;
    };
    cardshadow: {
      main: string;
    };
  }
  interface PaletteOptions {
    bg?: {
      hero?: string;
      section?: string;
      muted?: string;
      dark?: string;
      blackBg?: string;
      gray?: string;
      main?: string;
      gradient?: string;
      cardIconBg?: string;
    };
    chatbot?: {
      sidebar: string;
      chatBox: string;
    };
    darkcard?: {
      main: string;
      contrastText: string;
    };
    cardshadow?: {
      main: string;
    };
  }

  interface PaletteColor {
    focus?: string;
    hover?: string;
    hero?: string;
  }

  interface SimplePaletteColorOptions {
    focus?: string;
    hover?: string;
    hero?: string;
  }

  interface TypeText {
    white?: string;
    gray?: string;
    main: string;
    black?: string;
  }

  interface TypeTextOptions {
    white?: string;
    gray?: string;
    main?: string;
    black?: string;
  }
}

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700, fontSize: "3rem" },
    h2: { fontWeight: 600, fontSize: "2.25rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  palette: {
    primary: {
      main: "#F2F3EB",
      focus: "#378C92",
      hover: "#1F2540",
      hero: "#2D3239",
      dark: "#141414",
    },
    text: {
      primary: "#252525ff",
      secondary: "#ffffffff",
      white: "white",
      gray: "#6A6F78",
      main: "#378C92",
      black: "#151515ff",
    },
    bg: {
      hero: "#2D3239",
      section: "#F7F8F3",
      muted: "#F0F1EA",
      dark: "#141414",
      blackBg: "#030303ff",
      gray: "#f7f5f3",
      main: "#378C92",
      gradient: "linear-gradient(180deg, #F2F3EB 0%, #FFFFFF 100%)",
      cardIconBg:
        "linear-gradient(180deg, rgba(7,148,133,0.25), rgba(0,135,236,0.18))",
    },
    chatbot: {
      sidebar: "#6f6f6fff",
      chatBox: "#4747471a",
    },
    darkcard: {
      main: "#1C242C",
      contrastText: "#141921",
    },
    cardshadow: {
      main: "#242433ff",
    },
  },
});

export default theme;
