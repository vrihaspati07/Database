/**
 * Hind DB - Auth Controller
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

import { AuthService } from '../services/auth.service.js';
import { responseUtils } from '../utils/response.js';

export const AuthController = {
  async register(req, res, next) {
    try {
      const { email, fullName, password } = req.body;
      if (!email || !password) {
        return responseUtils.error(res, 'Email and password are required.', 400, 'VALIDATION_ERROR');
      }

      const result = await AuthService.register({ email, fullName: fullName || email.split('@')[0], password });
      return responseUtils.success(res, result, 'Account registered successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return responseUtils.error(res, 'Email and password are required.', 400, 'VALIDATION_ERROR');
      }

      const result = await AuthService.login({ email, password });
      return responseUtils.success(res, result, 'Login successful.');
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    return responseUtils.success(res, { user: req.user }, 'Current session fetched.');
  },
};
