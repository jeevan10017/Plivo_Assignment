import { prisma } from '../db/db.js';
import { AppError } from './errorHandler.js';

export const validateUserExists = async (req, res, next) => {
  try {
    const clerkId = req.userClerkId;
    const sessionClaims = req.auth.sessionClaims || {};

    const fallbackEmail = `${clerkId}@temp.user`;
    
    await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: sessionClaims.email || undefined,
        name: sessionClaims.name || undefined
      },
      create: {
        clerkId,
        email: sessionClaims.email || fallbackEmail,
        name: sessionClaims.name || 'New User',
        role: 'USER',
        avatarUrl: sessionClaims.picture || null
      }
    });

    next();
  } catch (error) {
    console.error('User validation error:', {
      error: error.message,
      clerkId: req.userClerkId,
      sessionClaims: req.auth.sessionClaims
    });
    next(new AppError('User validation failed: ' + error.message, 500));
  }
};