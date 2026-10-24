/**
 * Hind DB - Standardized Response Utility
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

export const responseUtils = {
  success(res, data = {}, message = 'Operation successful', statusCode = 200, meta = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        region: 'ap-south-1 (Sovereign)',
        attribution: '© 2026 Hind. A Hind India Private Limited Company.',
        ...meta,
      },
    });
  },

  error(res, message = 'An error occurred', statusCode = 500, code = 'ERROR', errors = null) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(errors ? { details: errors } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        region: 'ap-south-1 (Sovereign)',
        attribution: '© 2026 Hind. A Hind India Private Limited Company.',
      },
    });
  },

  paginated(res, items = [], page = 1, limit = 20, total = 0, message = 'Records fetched') {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
        attribution: '© 2026 Hind. A Hind India Private Limited Company.',
      },
    });
  },
};
