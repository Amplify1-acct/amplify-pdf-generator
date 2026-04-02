module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method not allowed' }); }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { return res.status(500).json({ error: 'API key not configured' }); }

  const { text } = req.body;
  if (!text) { return res.status(400).json({ error: 'No text provided' }); }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: 'You parse proposal documents into JSON. Return ONLY valid JSON — no markdown, no backticks, no explanation. Preserve all content faithfully.',
        messages: [{
          role: 'user',
          content: `Parse this proposal into JSON with this exact structure:
{
  "title": "full document title",
  "subtitle": "subtitle or empty string",
  "sections": [
    { "heading": "section heading or empty string for intro", "level": 1, "content": "full text preserving line breaks, bullets as - item, bold as **text**, italic as *text*" }
  ],
  "metadata": {
    "preparedFor": "client firm name",
    "preparedBy": "presenting company",
    "investment": "dollar amount if mentioned",
    "contactName": "contact person name",
    "contactTitle": "contact person title",
    "contactPhone": "contact phone"
  }
}

Document:
${text.substring(0, 8000)}`
        }]
      })
    });

    const data = await response.json();
    if (data.error) { return res.status(500).json({ error: data.error.message }); }

    let parsed = data.content[0].text.trim()
      .replace(/^```json\n?/i, '').replace(/^```\n?/, '').replace(/```$/, '').trim();

    res.status(200).json(JSON.parse(parsed));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
