import request from "supertest";
import app from "../src/server";
import { db } from "../src/db";

describe("/countries endpoint", () => {

  it("returns array of countries", async () => {
    const res = await request(app).get("/countries");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("filters countries by query", async () => {
    const res = await request(app).get("/countries?q=a");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 404 for non-existing country", async () => {
    const res = await request(app).get("/countries/99999/cities");
    expect(res.status).toBe(404);
  });

  it("returns cities for a real country", async () => {
    const country = await db.query("SELECT id FROM countries LIMIT 1");
    const id = country.rows[0].id;

    const res = await request(app).get(`/countries/${id}/cities`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});
