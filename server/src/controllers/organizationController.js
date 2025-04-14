import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import {slugify} from '../utils/stringUtils.js';
import { Clerk } from '@clerk/clerk-sdk-node';
import config from '../config/index.js';
import { isValidClerkOrgId, generateSlug } from '../utils/validation.js';

const clerkClient = Clerk({
  secretKey: config.clerk.secretKey,
  publishableKey: config.clerk.publishableKey
});

export const getOrganization = async (req, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.organizationId },
      include: {
        settings: true,
        members: {
          include: {
            user: true
          }
        }
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    res.set('Cache-Control', 'no-store'); 
    res.status(200).json({ organization });
  } catch (error) {
    next(error);
  }
};

export const syncOrganization = async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    
    if (!clerkId || !isValidClerkOrgId(clerkId)) {
      console.log('Received clerkId:', clerkId); // Debug log
      throw new AppError('Invalid organization ID format', 400);
    }
    const clerkOrg = await clerkClient.organizations.getOrganization({
      organizationId: clerkId
    });
    // Validate input
    if (!clerkId || !isValidClerkOrgId(clerkId)) {
      throw new AppError('Invalid Clerk organization ID format', 400);
    }


    // Validate Clerk response
    if (!clerkOrg || !clerkOrg.id) {
      throw new AppError('Organization not found in Clerk', 404);
    }

    // Sync with database
    const organization = await prisma.organization.upsert({
      where: { clerkId },
      update: {
        name: clerkOrg.name,
        slug: clerkOrg.slug || generateSlug(clerkOrg.name),
        updatedAt: new Date()
      },
      create: {
        clerkId,
        name: clerkOrg.name,
        slug: clerkOrg.slug || generateSlug(clerkOrg.name),
        settings: { create: {} }
      },
    });

    res.status(200).json({ organization });
  } catch (error) {
    console.error('Organization sync error:', {
      error: error.message,
      clerkId: req.params.clerkId,
      stack: error.stack
    });
    next(error);
  }
};

export const getOrganizationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const organization = await prisma.organization.findUnique({
      where: {
        slug,
      },
      include: {
        settings: true,
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    res.status(200).json({ organization });
  } catch (error) {
    next(error);
  }
};
