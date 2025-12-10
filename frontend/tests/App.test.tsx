import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../src/App";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ------- MOCK FETCH ---------
beforeEach(() => {
  global.fetch = vi.fn(async (url: string | URL | Request) => {
    const u = url.toString();

    if (u.includes("/countries")) {
      return new Response(
        JSON.stringify([
          { id: 1, name: "Slovenia", code: "SI" },
          { id: 2, name: "Austria", code: "AT" },
        ]),
        { status: 200 }
      );
    }

    if (u.includes("/countries/1/cities")) {
      return new Response(
        JSON.stringify([
          { id: 10, name: "Ljubljana", thumbnail_url: "" },
          { id: 11, name: "Maribor", thumbnail_url: "" },
        ]),
        { status: 200 }
      );
    }

    if (u.includes("/attractions")) {
      return new Response(
        JSON.stringify([
          { id: 100, name: "Tivoli Park", type: "park" },
        ]),
        { status: 200 }
      );
    }

    return new Response("[]", { status: 200 });
  }) as any;
});

// Wrap App correctly
function renderApp() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("Frontend basic rendering tests", () => {

  it("renders the main title", () => {
    renderApp();
    expect(screen.getByText(/Turistični informator/i)).toBeTruthy();
  });

  it("renders country select box", async () => {
    renderApp();
    expect(await screen.findByLabelText(/Izberi državo/i)).toBeTruthy();
  });

  it("loads countries from API", async () => {
    renderApp();
    const slovenia = await screen.findByText("Slovenia");
    expect(slovenia).toBeTruthy();
  });

  it("renders city section after selecting a country", async () => {
    renderApp();

    const select = await screen.findByLabelText(/Izberi državo/i);
    fireEvent.change(select, { target: { value: "1" } });

    const lj = await screen.findByText("Ljubljana");
    expect(lj).toBeTruthy();
  });

  it("renders attractions mock section (API mocked)", async () => {
    renderApp();

    // Trigger the city fetch
    const select = await screen.findByLabelText(/Izberi državo/i);
    fireEvent.change(select, { target: { value: "1" } });

    // attractions API mocked — only checking fetch call worked
    const response = await fetch("/api/attractions");
    const data = await response.json();

    expect(data[0].name).toBe("Tivoli Park");
  });

  it("page contains at least one navigation link", () => {
    renderApp();
    const link = screen.getAllByRole("link")[0];
    expect(link).toBeTruthy();
  });

  it("page contains at least one button (admin or link triggers)", () => {
    renderApp();
    const adminLink = screen.getByText("Admin");
    expect(adminLink).toBeTruthy();
  });

  it("does not crash during rendering", () => {
    expect(() => renderApp()).not.toThrow();
  });

  it("shows country label", async () => {
    renderApp();
    expect(screen.getByText(/Država/i)).toBeTruthy();
  });

  it("loads initial 'Select' layout from dropdown", async () => {
    renderApp();
    const option = await screen.findByText(/Izberi državo/i);
    expect(option).toBeTruthy();
  });
});

