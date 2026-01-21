import request from "supertest";
import app from "../src/server";

describe("Attractions endpoints", () => {

  it("returns 200 and array for /attractions", async () => {
    const res = await request(app).get("/attractions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 400 for invalid attraction id", async () => {
    const res = await request(app).get("/attractions/abc");
    expect(res.status).toBe(400);
  });

});
