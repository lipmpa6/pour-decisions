export default async function handler(req, res) {
  // Allow requests from anywhere (our app)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { APP_PASSWORD, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  // Check password on every request
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

  // GET — load data from GitHub
  if (req.method === 'GET') {
    const response = await fetch(ghUrl, { headers: ghHeaders });
    if (response.status === 404) return res.status(200).json({ data: null, sha: null });
    if (!response.ok) return res.status(500).json({ error: 'Failed to load data' });
    const json = await response.json();
    const data = JSON.parse(Buffer.from(json.content, 'base64').toString('utf8'));
    return res.status(200).json({ data, sha: json.sha });
  }

  // PUT — save data to GitHub
  if (req.method === 'PUT') {
    const { data, sha } = req.body;
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
    return res.status(200).json({ sha: json.content.sha });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
