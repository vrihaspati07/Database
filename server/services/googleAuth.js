/**
 * Hind DB - Google OAuth 2.0 Client Service
 * Product: Hind DB
 */

import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';

let oauth2Client = null;

function getClient() {
  if (!oauth2Client) {
    oauth2Client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }
  return oauth2Client;
}

export function generateGoogleAuthUrl(state) {
  const client = getClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });
}

export async function verifyGoogleAuthCode(code) {
  const client = getClient();
  const { tokens } = await client.getToken(code);
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Failed to extract Google ID token payload');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: Boolean(payload.email_verified),
    full_name: payload.name || payload.given_name || (payload.email ? payload.email.split('@')[0] : 'User'),
    avatar_url: payload.picture || null,
  };
}
