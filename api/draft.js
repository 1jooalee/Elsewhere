// Vercel function: writes a one-line AI draft forecast. Needs ANTHROPIC_API_KEY set in Vercel.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const facts = String((req.body && req.body.facts) || "").slice(0, 800);
  if (!facts) return res.status(400).json({ error: "No facts given" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 120,
        system: "Write ONE sentence, 30 words at most, in the voice of a weather presenter forecasting conditions on an exoplanet. Use only the facts given and invent no numbers. Treat it as speculation and do not state clouds, rain or wind as fact unless the facts name a published claim, and then hedge it. Reply with the sentence only.",
        messages: [{ role: "user", content: facts }]
      })
    });
    if (!r.ok) return res.status(502).json({ error: "Model request failed" });
    const j = await r.json();
    res.status(200).json({ text: (j.content || []).map(c => c.text || "").join("").trim() });
  } catch (e) {
    res.status(502).json({ error: "Model unreachable" });
  }
}
