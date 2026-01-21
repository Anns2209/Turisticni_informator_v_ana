"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts

const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// --- COUNTRIES ---
app.get("/countries", async (req, res, next) => {
    try {
        const q = String(req.query.q || "").trim();
        const sql = q
            ? {
                text: "SELECT id,code,name FROM countries WHERE name ILIKE $1 ORDER BY name",
                values: [`%${q}%`],
            }
            : {
                text: "SELECT id,code,name FROM countries ORDER BY name",
                values: [],
            };
        const { rows } = await db_1.db.query(sql);
        res.json(rows);
    }
    catch (e) {
        next(e);
    }
});
// --- CITIES FOR COUNTRY ---
app.get("/countries/:id/cities", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "invalid_country_id" });
        const exists = await db_1.db.query("SELECT 1 FROM countries WHERE id=$1", [id]);
        if (!exists.rowCount)
            return res.status(404).json({ error: "country_not_found" });
        const { rows } = await db_1.db.query("SELECT id,name,thumbnail_url FROM cities WHERE country_id=$1 ORDER BY name", [id]);
        res.json(rows);
    }
    catch (e) {
        next(e);
    }
});
// --- CITY DETAILS ---
app.get("/cities/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "invalid_city_id" });
        const { rows } = await db_1.db.query("SELECT id,name,description,hero_url FROM cities WHERE id=$1", [id]);
        if (!rows.length)
            return res.status(404).json({ error: "city_not_found" });
        res.json(rows[0]);
    }
    catch (e) {
        next(e);
    }
});
// --- CITY IMAGES ---
app.get("/cities/:id/images", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "invalid_city_id" });
        const { rows } = await db_1.db.query("SELECT url FROM city_images WHERE city_id=$1 ORDER BY sort_order, id", [id]);
        res.json(rows.map((r) => r.url));
    }
    catch (e) {
        next(e);
    }
});
// --- ATTRACTIONS LIST ---
app.get("/attractions", async (req, res, next) => {
    try {
        const cityId = req.query.city_id ? Number(req.query.city_id) : undefined;
        const type = req.query.type?.trim();
        const q = req.query.q?.trim();
        const where = [];
        const vals = [];
        if (Number.isFinite(cityId)) {
            where.push(`city_id = $${vals.length + 1}`);
            vals.push(cityId);
        }
        if (type) {
            where.push(`type ILIKE $${vals.length + 1}`);
            vals.push(type);
        }
        if (q) {
            where.push(`(name ILIKE $${vals.length + 1} OR description ILIKE $${vals.length + 1})`);
            vals.push(`%${q}%`);
        }
        const sql = `
      SELECT id, city_id, name, type, thumbnail_url
      FROM attractions
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY name`;
        const { rows } = await db_1.db.query(sql, vals);
        res.json(rows);
    }
    catch (e) {
        next(e);
    }
});
// --- ATTRACTION DETAILS ---
app.get("/attractions/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            return res.status(400).json({ error: "invalid_attraction_id" });
        const { rows } = await db_1.db.query(`SELECT id,city_id,name,type,description,hero_url,thumbnail_url,lat,lng 
       FROM attractions WHERE id=$1`, [id]);
        if (!rows.length)
            return res.status(404).json({ error: "attraction_not_found" });
        res.json(rows[0]);
    }
    catch (e) {
        next(e);
    }
});
// --- ADMIN ROUTES ---
app.get("/admin/countries", async (req, res, next) => {
    try {
        const { rows } = await db_1.db.query("SELECT id, code, name FROM countries ORDER BY name");
        res.json(rows);
    }
    catch (e) {
        next(e);
    }
});
app.post("/admin/countries", async (req, res, next) => {
    try {
        const { code, name } = req.body;
        if (!code || !name)
            return res.status(400).json({ error: "missing_fields" });
        const sql = "INSERT INTO countries (code, name) VALUES ($1, $2) RETURNING id, code, name";
        const { rows } = await db_1.db.query(sql, [code, name]);
        res.json(rows[0]);
    }
    catch (e) {
        next(e);
    }
});
app.get("/admin/cities", async (req, res, next) => {
    try {
        const { rows } = await db_1.db.query("SELECT id, country_id, name, thumbnail_url FROM cities ORDER BY id");
        res.json(rows);
    }
    catch (e) {
        next(e);
    }
});
app.post("/admin/cities", async (req, res, next) => {
    try {
        const { country_id, name, thumbnail_url } = req.body;
        if (!country_id || !name)
            return res.status(400).json({ error: "missing_fields" });
        const sql = `
      INSERT INTO cities (country_id, name, thumbnail_url)
      VALUES ($1, $2, $3)
      RETURNING id, country_id, name, thumbnail_url
    `;
        const { rows } = await db_1.db.query(sql, [
            country_id,
            name,
            thumbnail_url || null,
        ]);
        res.json(rows[0]);
    }
    catch (e) {
        next(e);
    }
});
// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("❌ BACKEND ERROR:", err);
    res.status(500).json({ error: "internal_error" });
});
// EXPORT ONLY APP — NO LISTEN HERE!
exports.default = app;

// ===== Render/Prod startup =====
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  process.exit(1);
});

// Render provides PORT. Must listen on 0.0.0.0 in containers.
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0");


