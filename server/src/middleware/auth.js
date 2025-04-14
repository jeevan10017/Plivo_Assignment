
import { Webhook } from 'svix';
import { prisma } from '../db/db.js';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import config from '../config/index.js';
import { AppError } from './errorHandler.js';
import { Clerk } from '@clerk/clerk-sdk-node';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const authMiddleware = ClerkExpressWithAuth({
  secretKey: config.clerk.secretKey,
  publishableKey: config.clerk.publishableKey,
});

const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export const requireUser = ClerkExpressRequireAuth({
  onError: (error) => {
    throw new AppError('Authentication required', 401);
  },
  
  sessionClaims: {
    email: true,
    name: true,
    picture: true,
    org_id: true
  }
});

export const requireOrganization = async (req, res, next) => {
  try {
    const clerkOrgId = req.auth.orgId;
    req.userClerkId = req.auth.userId;
    
    if (!clerkOrgId) {
      req.organizationId = null;
      return next();
    }
    if (!clerkOrgId) {
      throw new AppError('Organization membership required', 403);
    }

    let organization = await prisma.organization.findUnique({
      where: { clerkId: clerkOrgId },
    });

    if (!organization) {
      const clerkOrg = await clerkClient.organizations.getOrganization({
        organizationId: clerkOrgId
      });

     
      try {
        organization = await prisma.organization.create({
          data: {
            clerkId: clerkOrgId,
            name: clerkOrg.name,
            slug: clerkOrg.slug || generateSlug(clerkOrg.name),
            settings: { create: {} }
          }
        });
      } catch (createError) {
        if (createError.code === 'P2002') {
        
          organization = await prisma.organization.findUnique({
            where: { clerkId: clerkOrgId }
          });
          
          if (!organization) {
            throw new AppError('Organization creation race condition failed', 500);
          }
        } else {
          throw createError;
        }
      }


      if (organization.slug !== (clerkOrg.slug || generateSlug(clerkOrg.name))) {
        organization = await prisma.organization.update({
          where: { id: organization.id },
          data: {
            name: clerkOrg.name,
            slug: clerkOrg.slug || generateSlug(clerkOrg.name)
          }
        });
      }
    }

    req.organizationId = organization.id;
    next();
  } catch (error) {
    console.error('Organization sync error:', {
      error: error.message,
      clerkOrgId,
      stack: error.stack
    });
    next(new AppError('Organization configuration failed: ' + error.message, 500));
  }
};


const withRetry = async (fn, retries = 3, delay = 100) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.code === 'P2002') {
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (req.userRole !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};


export const webhookHandler = async (req, res, next) => {
  try {
    const event = await ClerkWebhooks.verifyWebhook({
      payload: req.body,
      header: req.headers,
    });
    
    req.webhookEvent = event;
    next();
  } catch (err) {
    next(new AppError('Webhook verification failed', 401));
  }
};