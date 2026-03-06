export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { APP_PASSWORD, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, SLACK_WEBHOOK_URL } = process.env;

  const password = req.headers['x-app-password'];
  if (!password || password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const ghUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`;
  const ghHeaders = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
  };

  if (req.method === 'GET') {
    const response = await fetch(ghUrl, { headers: ghHeaders });
    if (response.status === 404) return res.status(200).json({ data: null, sha: null });
    if (!response.ok) return res.status(500).json({ error: 'Failed to load data' });
    const json = await response.json();
    const data = JSON.parse(Buffer.from(json.content, 'base64').toString('utf8'));
    return res.status(200).json({ data, sha: json.sha });
  }

  if (req.method === 'PUT') {
    const { data, sha, newDebts } = req.body;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const body = { message: 'Update Pour Decisions data', content };
    if (sha) body.sha = sha;

    const response = await fetch(ghUrl, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const json = await response.json();

    if (SLACK_WEBHOOK_URL && newDebts && newDebts.length > 0) {
      for (const debt of newDebts) {
        const reasonText = debt.reason ? ` · 💬 _${debt.reason}_` : '';
        const message = `🍺 *${debt.from}* owes *${debt.to}* ${debt.qty}× ${debt.drink}${reasonText}`;
        await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });
      }
    }

    return res.status(200).json({ sha: json.content.sha });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
