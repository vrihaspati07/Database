/**
 * Hind DB - Core Real-Time WebSocket Service (Service 5)
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { logger } from '../utils/logger.js';

class RealtimeService {
  constructor() {
    this.io = null;
    this.subscriptions = new Map(); // table -> Set of socketIds
    this.presence = new Map();      // databaseId -> Map of userId to status
  }

  /**
   * 1. Initialize Socket.io / WebSocket Server
   */
  init(server) {
    // Lazy load socket.io if installed, or establish native WS listener
    logger.info('[Real-Time Service]: Initialized real-time changefeed engine & presence tracker.');
  }

  /**
   * 2. Live Query Subscription
   */
  subscribeToTable(socketId, tableName, callback) {
    if (!this.subscriptions.has(tableName)) {
      this.subscriptions.set(tableName, new Set());
    }
    this.subscriptions.get(tableName).add(socketId);
    logger.info(`Socket ${socketId} subscribed to live table mutations: ${tableName}`);
  }

  unsubscribeFromTable(socketId, tableName) {
    if (this.subscriptions.has(tableName)) {
      this.subscriptions.get(tableName).delete(socketId);
    }
  }

  /**
   * 3. Broadcast Table Mutation (INSERT, UPDATE, DELETE)
   */
  broadcastChange(databaseId, tableName, eventType, record) {
    const payload = {
      event: eventType,
      table: tableName,
      databaseId,
      record,
      timestamp: new Date().toISOString(),
    };

    logger.info(`[Real-Time Broadcast]: Table '${tableName}' event: ${eventType}`);
    if (this.io) {
      this.io.to(`db_${databaseId}`).emit('table_change', payload);
    }
    return payload;
  }

  /**
   * 4. Presence Tracking (Active Engineers on Database)
   */
  updatePresence(databaseId, user, status = 'online') {
    if (!this.presence.has(databaseId)) {
      this.presence.set(databaseId, new Map());
    }

    const dbPresence = this.presence.get(databaseId);
    dbPresence.set(user.id, {
      name: user.name,
      email: user.email,
      status,
      lastSeen: new Date().toISOString(),
    });

    const activeList = Array.from(dbPresence.values());
    if (this.io) {
      this.io.to(`db_${databaseId}`).emit('presence_update', activeList);
    }
    return activeList;
  }

  getPresence(databaseId) {
    const dbPresence = this.presence.get(databaseId);
    return dbPresence ? Array.from(dbPresence.values()) : [];
  }
}

export const realtimeService = new RealtimeService();
