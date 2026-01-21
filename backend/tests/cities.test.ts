import request from "supertest";
import app from "../src/server";
import { db } from "../src/db";

describe("City endpoints", () => {

  it("returns 400 for invalid city id", async () => {
    const res = await request(app).get("/cities/abc");
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existing city", async () => {
    const res = await request(app).get("/cities/99999");
    expect(res.status).toBe(404);
  });

  it("returns data for existing city", async () => {
    const city = await db.query("SELECT id FROM cities LIMIT 1");
    const id = city.rows[0].id;

    const res = await request(app).get(`/cities/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name");
  });

});
