// src/theme/mui.d.ts
import "@mui/material/styles";

export {};

declare module "@mui/material/styles" {
  interface TypeText {
    main: string;
    white?: string;
    gray?: string;
    black?: string;
  }

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
}
