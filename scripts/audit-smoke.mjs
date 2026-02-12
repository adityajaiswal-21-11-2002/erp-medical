#!/usr/bin/env node
/**
 * Smoke audit: hits key API endpoints and reports PASS/FAIL.
 * Usage: AUDIT_API_URL=http://localhost:3000 node scripts/audit-smoke.mjs
 * Or with auth token: AUDIT_TOKEN=<jwt> node scripts/audit-smoke.mjs
 * Requires: API server or Next.js running (dev or start).
 */
const BASE = process.env.AUDIT_API_URL || process.env.E2E_API_URL || "http://localhost:3000";
const AUDIT_TOKEN = process.env.AUDIT_TOKEN;

const results = { pass: [], fail: [] };

async function request(method, path, body = null) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (AUDIT_TOKEN) opts.headers.Authorization = `Bearer ${AUDIT_TOKEN}`;
  if (body && (method === "POST" || method === "PATCH")) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return { status: res.status, ok: res.ok, data: await res.json().catch(() => ({})) };
}

async function run() {
  console.log("Audit API base:", BASE);
  console.log("");

  // 1) Health (no auth)
  try {
    const r = await request("GET", "/api/health");
    if (r.status === 200 && r.data?.success) {
      results.pass.push("GET /api/health");
    } else {
      results.fail.push(`GET /api/health → ${r.status}`);
    }
  } catch (e) {
    results.fail.push(`GET /api/health → ${e.message}`);
  }

  // 2) Login (get token for subsequent calls)
  let token = AUDIT_TOKEN;
  try {
    const r = await request("POST", "/api/auth/login", {
      email: "admin@demo.com",
      password: "Admin@123",
    });
    if (r.status === 200 && r.data?.data?.accessToken) {
      token = r.data.data.accessToken;
      results.pass.push("POST /api/auth/login (admin)");
    } else {
      results.fail.push(`POST /api/auth/login → ${r.status} (seed may be needed)`);
    }
  } catch (e) {
    results.fail.push(`POST /api/auth/login → ${e.message}`);
  }

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const get = (path) => fetch(`${BASE}${path}`, { headers: { ...authHeaders } }).then((r) => ({ status: r.status, ok: r.ok }));
  const post = (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body || {}),
    }).then((r) => ({ status: r.status, ok: r.ok }));

  if (token) {
    const endpoints = [
      ["GET", "/api/users?limit=1"],
      ["GET", "/api/orders?limit=1"],
      ["GET", "/api/products?limit=1"],
      ["GET", "/api/feature-flags"],
      ["GET", "/api/kyc/submissions"],
      ["GET", "/api/sync/logs"],
      ["GET", "/api/compliance"],
      ["GET", "/api/tickets"],
      ["GET", "/api/banners"],
      ["GET", "/api/analytics/summary"],
      ["GET", "/api/distributor/orders"],
      ["GET", "/api/shipments/logs"],
    ];
    for (const [method, path] of endpoints) {
      try {
        const r = method === "GET" ? await get(path) : await post(path);
        if (r.status === 200 || r.status === 201) {
          results.pass.push(`${method} ${path}`);
        } else {
          results.fail.push(`${method} ${path} → ${r.status}`);
        }
      } catch (e) {
        results.fail.push(`${method} ${path} → ${e.message}`);
      }
    }
  }

  console.log("--- Results ---");
  console.log("PASS:", results.pass.length);
  results.pass.forEach((p) => console.log("  ", p));
  console.log("FAIL:", results.fail.length);
  results.fail.forEach((f) => console.log("  ", f));
  console.log("");
  process.exit(results.fail.length > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
