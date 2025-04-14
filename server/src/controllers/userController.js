import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
// import logger from '../utils/logger';

export const getCurrentUser = async (req, res, next) => {
  try {
    // Get user from middleware-ensured data
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userClerkId },
      select: {
        id: true,
        clerkId: true,  // Include Clerk ID in response
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            settings: true,
          },
        },
      },
    });

    if (!user) {
      // This should never happen due to middleware, but handle just in case
      throw new AppError('User session needs refresh', 401);
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

