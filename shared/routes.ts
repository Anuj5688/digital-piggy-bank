import { z } from 'zod';
import { insertTransactionSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  balances: {
    get: {
      method: 'GET' as const,
      path: '/api/balance' as const,
      responses: {
        200: z.object({ amount: z.number() }),
        401: errorSchemas.unauthorized,
      }
    }
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions' as const,
      responses: {
        200: z.array(z.any()), 
        401: errorSchemas.unauthorized,
      }
    },
    deposit: {
      method: 'POST' as const,
      path: '/api/transactions/deposit' as const,
      input: z.object({ 
        amount: z.number().positive(),
        externalApp: z.string().optional(),
        upiId: z.string().optional()
      }),
      responses: {
        200: z.any(), 
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/transactions/withdraw' as const,
      input: z.object({ 
        amount: z.number().positive(),
        upiId: z.string().min(1, "UPI ID is required")
      }),
      responses: {
        200: z.any(), 
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    transfer: {
      method: 'POST' as const,
      path: '/api/transactions/transfer' as const,
      input: z.object({ 
        amount: z.number().positive(), 
        toUserId: z.string(),
        description: z.string().optional()
      }),
      responses: {
        200: z.any(), 
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      input: z.object({ search: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.any()), 
        401: errorSchemas.unauthorized,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
