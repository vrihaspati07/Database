/**
 * Hind DB - Server Configuration
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { config as globalConfig } from './config/index.js';

export const config = {
  port: globalConfig.app.port,
  nodeEnv: globalConfig.app.env,
  appUrl: globalConfig.app.frontendUrl,
  apiUrl: globalConfig.app.backendUrl,
  frontendUrl: globalConfig.app.frontendUrl,
  backendUrl: globalConfig.app.backendUrl,

  database: {
    connectionString: globalConfig.db.databaseUrl,
    ssl: globalConfig.db.ssl,
    maxConnections: globalConfig.db.max,
  },

  jwt: {
    accessSecret: globalConfig.app.jwtAccessSecret,
    refreshSecret: globalConfig.app.refreshSecret,
    accessExpiresIn: globalConfig.app.jwtExpiresIn,
    refreshExpiresIn: globalConfig.app.refreshExpiresIn,
  },

  oauth: {
    google: {
      clientId: globalConfig.google.clientId,
      clientSecret: globalConfig.google.clientSecret,
      redirectUri: globalConfig.google.redirectUri,
    },
  },

  smtp: globalConfig.smtp,
};
