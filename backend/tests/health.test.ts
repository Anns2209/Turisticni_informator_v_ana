import request from "supertest";
import app from "../src/server";

describe("Health endpoint", () => {
  it("returns 404 for unknown routes (server running)", async () => {
    const res = await request(app).get("/thisdoesnotexist");
    expect(res.status).toBe(404);
  });
});
