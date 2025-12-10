import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ------- MOCK FETCH ---------
beforeEach(() => {
  global.fetch = vi.fn(async (url: string | URL | Request) => {
    let data: any = [];
    
    if (url.toString().includes("/countries")) {
      data = [
        { id: 1, name: "Slovenia", code: "SI" },
        { id: 2, name: "Austria", code: "AT" },
      ];
    } else if (url.toString().includes("/cities")) {
      data = [
        { id: 10, name: "Ljubljana", thumbnail_url: "" },
        { id: 11, name: "Maribor", thumbnail_url: "" },
      ];
    } else if (url.toString().includes("/attractions")) {
      data = [
        { id: 100, name: "Tivoli Park", type: "park" },
        { id: 101, name: "Castle", type: "museum" },
      ];
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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

// ---------------------------
//        TESTS
// ---------------------------

describe("Frontend basic rendering tests", () => {
  it("renders main title", () => {
    renderApp();
    expect(screen.getByText(/Tourist Information/i)).toBeTruthy();
  });

  it("renders country select box", () => {
    renderApp();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("loads countries from API", async () => {
    renderApp();
    const slovenia = await screen.findByText("Slovenia");
    expect(slovenia).toBeTruthy();
  });

  it("renders city section after country selection", async () => {
    renderApp();
    const lj = await screen.findByText("Ljubljana");
    expect(lj).toBeTruthy();
  });

  it("renders attractions section", async () => {
    renderApp();
    const park = await screen.findByText("Tivoli Park");
    expect(park).toBeTruthy();
  });

  it("page contains at least one button", () => {
    renderApp();
    const btn = screen.getAllByRole("button")[0];
    expect(btn).toBeTruthy();
  });

  it("page contains at least one link", () => {
    renderApp();
    // fallback: check anchor tags
    expect(document.querySelector("a")).not.toBeNull();
  });

  it("should not crash while rendering", () => {
    expect(() => renderApp()).not.toThrow();
  });

  it("shows default layout elements", () => {
    renderApp();
    expect(screen.getByText(/Country/i)).toBeTruthy();
  });

  it("loads initial layout", () => {
    renderApp();
    expect(screen.getByText(/Select/i)).toBeTruthy();
  });
});

