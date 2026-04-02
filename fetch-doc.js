export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { docId } = req.query;
  if (!docId || !/^[a-zA-Z0-9_-]+$/.test(docId)) {
    return res.status(400).json({ error: 'Invalid doc ID' });
  }

  try {
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const response = await fetch(exportUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Could not fetch doc. Make sure sharing is set to "Anyone with the link → Viewer".' 
      });
    }
    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
