import { describe, expect, it } from "vitest";
import { getSectionStyleSx } from "../sectionStyle";

describe("getSectionStyleSx", () => {
  it("returns an empty object when section style is missing", () => {
    expect(getSectionStyleSx({ heading: "Hello" })).toEqual({});
  });

  it("maps background and spacing values into sx props", () => {
    expect(
      getSectionStyleSx({
        sectionStyle: {
          backgroundColor: "#f8fafc",
          backgroundImageUrl: "https://example.com/hero.jpg",
          layoutWidth: "page",
          heightPreset: "medium",
          contentAlign: "center",
          paddingTop: "24px",
          paddingBottom: "48px",
          paddingLeft: "20px",
          paddingRight: "28px",
          marginTop: "16px",
          marginBottom: "32px",
          marginLeft: "12px",
          marginRight: "18px",
        },
      }),
    ).toEqual({
      backgroundColor: "#f8fafc",
      backgroundImage: "url(https://example.com/hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "480px",
      textAlign: "center",
      paddingTop: "24px",
      paddingBottom: "48px",
      paddingLeft: "20px",
      paddingRight: "28px",
      marginTop: "16px",
      marginBottom: "32px",
      marginLeft: "12px",
      marginRight: "18px",
    });
  });
});
