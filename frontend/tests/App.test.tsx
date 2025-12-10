import { render, screen } from "@testing-library/react";
import App from "../src/App";
import userEvent from "@testing-library/user-event";

describe("Frontend basic rendering tests", () => {

  test("renders main title", () => {
    render(<App />);
    expect(screen.getByText(/Choose a country/i)).toBeInTheDocument();
  });

  test("renders country select box", () => {
    render(<App />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("shows loading message when fetching countries", () => {
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("handles error state properly", () => {
    render(<App />);
    expect(screen.queryByText("Napaka pri nalaganju")).not.toBeNull();
  });

  test("renders city section", () => {
    render(<App />);
    expect(screen.getByText(/Cities/i)).toBeInTheDocument();
  });

  test("renders attractions title", () => {
    render(<App />);
    expect(screen.getByText(/Attractions/i)).toBeInTheDocument();
  });

  test("buttons are clickable", async () => {
    render(<App />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(button).toBeEnabled();
  });

  test("page contains at least one link", () => {
    render(<App />);
    expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(1);
  });

  test("should render container div", () => {
    render(<App />);
    expect(document.querySelector("#root")).toBeTruthy();
  });

  test("should not crash on empty initial state", () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
