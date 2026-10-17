// Vercel/Netlify-style function: proxies read-only ADQL queries to the NASA Exoplanet Archive.
export default async function handler(req, res) {
  const q = req.query.query;
  if (!q || !/^\s*select\s/i.test(q) || q.length > 800) {
    return res.status(400).json({ error: "Only short SELECT queries are allowed." });
  }
  try {
    const r = await fetch(
      "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?format=json&query=" + encodeURIComponent(q)
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=3600");
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(await r.text());
  } catch (e) {
    res.status(502).json({ error: "Archive unreachable" });
  }
}
