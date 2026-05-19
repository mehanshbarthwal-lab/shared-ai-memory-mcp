// src/oauth.ts
// OAuth 2.1 + Dynamic Client Registration + PKCE for Claude connector compatibility
// Spec: MCP 2025-06-18, RFC 7591, RFC 9728, RFC 7636

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// ─── In-memory stores (fine for single-instance Render free tier) ───────────
// If you ever scale to multiple instances, swap these for Supabase rows.

interface OAuthClient {
  client_id: string;
  client_name?: string;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  created_at: number;
}

interface AuthCode {
  code: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: string;
  expires_at: number;
  approved: boolean;
}

interface AccessToken {
  token: string;
  client_id: string;
  expires_at: number;
  scope: string;
}

const clients = new Map<string, OAuthClient>();
const authCodes = new Map<string, AuthCode>();
const accessTokens = new Map<string, AccessToken>();

// ─── Config ─────────────────────────────────────────────────────────────────

const SERVER_URL = process.env.SERVER_URL || 'https://shared-ai-memory-mcp.onrender.com';
const STATIC_TOKEN = process.env.MEMORY_MCP_TOKEN || '';
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const CODE_TTL_MS = 5 * 60 * 1000;   // 5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateToken(prefix = ''): string {
  return prefix + crypto.randomBytes(32).toString('hex');
}

function verifyPKCE(verifier: string, challenge: string, method: string): boolean {
  if (method === 'S256') {
    const computed = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    return computed === challenge;
  }
  if (method === 'plain') {
    return verifier === challenge;
  }
  return false;
}

function isValidToken(token: string): boolean {
  // Accept our issued OAuth tokens
  const entry = accessTokens.get(token);
  if (entry && entry.expires_at > Date.now()) return true;

  // Also accept the static MEMORY_MCP_TOKEN as a fallback
  // so Claude Code / Claude Desktop still work with their Authorization header
  if (STATIC_TOKEN && token === STATIC_TOKEN) return true;

  return false;
}

// Export for use in server.ts middleware
export { isValidToken };

// ─── Router ──────────────────────────────────────────────────────────────────

export const oauthRouter = Router();

// 1. Protected Resource Metadata  (RFC 9728)
//    Claude fetches this first when it gets a 401 from /mcp
oauthRouter.get('/.well-known/oauth-protected-resource', (_req: Request, res: Response) => {
  res.json({
    resource: SERVER_URL,
    authorization_servers: [`${SERVER_URL}`],
    scopes_supported: ['memory:read', 'memory:write'],
    bearer_methods_supported: ['header'],
  });
});

// 2. Authorization Server Metadata  (RFC 8414)
//    Claude uses this to discover all the OAuth endpoints
oauthRouter.get('/.well-known/oauth-authorization-server', (_req: Request, res: Response) => {
  res.json({
    issuer: SERVER_URL,
    authorization_endpoint: `${SERVER_URL}/oauth/authorize`,
    token_endpoint: `${SERVER_URL}/oauth/token`,
    registration_endpoint: `${SERVER_URL}/oauth/register`,
    scopes_supported: ['memory:read', 'memory:write'],
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
  });
});

// 3. Dynamic Client Registration  (RFC 7591)
//    Claude self-registers here — you never have to pre-create a client
oauthRouter.post('/oauth/register', (req: Request, res: Response) => {
  const body = req.body || {};
  const redirect_uris: string[] = body.redirect_uris || [];

  if (!Array.isArray(redirect_uris) || redirect_uris.length === 0) {
    res.status(400).json({ error: 'invalid_client_metadata', error_description: 'redirect_uris required' });
    return;
  }

  const client: OAuthClient = {
    client_id: uuidv4(),
    client_name: body.client_name || 'Claude',
    redirect_uris,
    grant_types: body.grant_types || ['authorization_code'],
    response_types: body.response_types || ['code'],
    token_endpoint_auth_method: 'none', // public client — no secret needed
    created_at: Date.now(),
  };

  clients.set(client.client_id, client);

  res.status(201).json({
    client_id: client.client_id,
    client_name: client.client_name,
    redirect_uris: client.redirect_uris,
    grant_types: client.grant_types,
    response_types: client.response_types,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
  });
});

// 4. Authorization Endpoint
//    Claude opens this in the user's browser; we auto-approve since this is your personal server
oauthRouter.get('/oauth/authorize', (req: Request, res: Response) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    code_challenge,
    code_challenge_method,
    state,
  } = req.query as Record<string, string>;

  // Validate client
  const client = clients.get(client_id);
  if (!client) {
    res.status(400).send('Unknown client_id');
    return;
  }

  if (!client.redirect_uris.includes(redirect_uri)) {
    res.status(400).send('redirect_uri mismatch');
    return;
  }

  if (response_type !== 'code') {
    res.status(400).send('Only response_type=code supported');
    return;
  }

  if (!code_challenge || code_challenge_method !== 'S256') {
    res.status(400).send('PKCE S256 required');
    return;
  }

  // Since this is your personal server, show a simple approve page
  // rather than a full login form — just one button that issues the code
  const code = generateToken('code_');
  authCodes.set(code, {
    code,
    client_id,
    redirect_uri,
    code_challenge,
    code_challenge_method,
    expires_at: Date.now() + CODE_TTL_MS,
    approved: false,
  });

  // Render a minimal consent page
  const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
  const approveUrl = `/oauth/approve?code=${code}${stateParam}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Connect Claude to Memory Server</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; padding: 0 24px; color: #1a1a1a; }
        h1 { font-size: 1.4rem; margin-bottom: 8px; }
        p { color: #555; margin-bottom: 32px; }
        button {
          background: #1a1a1a; color: #fff; border: none; padding: 12px 28px;
          font-size: 1rem; border-radius: 8px; cursor: pointer; width: 100%;
        }
        button:hover { background: #333; }
      </style>
    </head>
    <body>
      <h1>🧠 Shared AI Memory</h1>
      <p>Claude wants to connect to your personal memory server so it can read and save memories across sessions.</p>
      <form method="GET" action="${approveUrl}">
        <button type="submit">Approve Access</button>
      </form>
    </body>
    </html>
  `);
});

// 5. Approve endpoint (handles the button click from the consent page)
oauthRouter.get('/oauth/approve', (req: Request, res: Response) => {
  const { code, state, redirect_uri } = req.query as Record<string, string>;

  const authCode = authCodes.get(code);
  if (!authCode || authCode.expires_at < Date.now()) {
    res.status(400).send('Code expired or invalid');
    return;
  }

  // Mark as approved
  authCode.approved = true;
  authCodes.set(code, authCode);

  // Redirect back to Claude with the code
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);

  res.redirect(redirectUrl.toString());
});

// 6. Token Endpoint
//    Claude exchanges the auth code + PKCE verifier for an access token
oauthRouter.post('/oauth/token', (req: Request, res: Response) => {
  const { grant_type, code, redirect_uri, code_verifier, client_id } = req.body || {};

  if (grant_type !== 'authorization_code') {
    res.status(400).json({ error: 'unsupported_grant_type' });
    return;
  }

  const authCode = authCodes.get(code);
  if (!authCode) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'Code not found' });
    return;
  }

  if (!authCode.approved) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'Code not approved' });
    return;
  }

  if (authCode.expires_at < Date.now()) {
    authCodes.delete(code);
    res.status(400).json({ error: 'invalid_grant', error_description: 'Code expired' });
    return;
  }

  if (authCode.client_id !== client_id) {
    res.status(400).json({ error: 'invalid_client' });
    return;
  }

  if (authCode.redirect_uri !== redirect_uri) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' });
    return;
  }

  if (!verifyPKCE(code_verifier, authCode.code_challenge, authCode.code_challenge_method)) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
    return;
  }

  // One-time use — delete the code immediately
  authCodes.delete(code);

  // Issue access token
  const accessToken: AccessToken = {
    token: generateToken('mcp_'),
    client_id,
    expires_at: Date.now() + TOKEN_TTL_MS,
    scope: 'memory:read memory:write',
  };

  accessTokens.set(accessToken.token, accessToken);

  res.json({
    access_token: accessToken.token,
    token_type: 'Bearer',
    expires_in: TOKEN_TTL_MS / 1000,
    scope: accessToken.scope,
  });
});