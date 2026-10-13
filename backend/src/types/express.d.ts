declare global {
  namespace Express {
    interface Request {
      user: { id: string; name: string; email: string; createdAt: string };
      idempotencyContext?: { key: string; fingerprint: string; ownerToken: string; expiresAt: Date };
    }
  }
}

export {};
