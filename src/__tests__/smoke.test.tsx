import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

describe("Smoke Tests", () => {
  it("should pass a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should render a simple component", () => {
    const TestComponent = () => <div>Hello Test</div>;
    const { container } = render(<TestComponent />);
    expect(container.textContent).toBe("Hello Test");
  });

  it("should work with Router", () => {
    const TestComponent = () => <div>Router Test</div>;
    const { container } = render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>,
    );
    expect(container.textContent).toBe("Router Test");
  });
});
