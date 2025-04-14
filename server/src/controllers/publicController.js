import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const getOrganizationList = async (req, res, next) => {
  try {
   
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

  
    const organizations = await prisma.organization.findMany({
      select: {
        name: true,
        slug: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalCount = await prisma.organization.count();

    res.status(200).json({
      success: true,
      organizations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalOrganizations: totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Organization list error:', {
      message: error.message,
      query: req.query,
      stack: error.stack
    });
    next(new AppError('Failed to fetch organization list. Please try again later.', 500));
  }
};

export const getOrganizationStatus = async (req, res, next) => {
  try {
    const { orgSlug } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: { settings: true },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    const [services, incidents, maintenances] = await Promise.all([
      prisma.service.findMany({
        where: {
          organizationId: organization.id,
          isPublic: true,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              status: true,
              createdAt: true,
            },
          },
        },
      }),

      prisma.incident.findMany({
        where: {
          organizationId: organization.id,
          status: {
            in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'],
          },
        },
        include: {
          services: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          updates: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.maintenance.findMany({
        where: {
          organizationId: organization.id,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          services: {
            some: {
              service: {
                isPublic: true,
              },
            },
          },
        },
        include: {
          services: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { scheduledStart: 'asc' },
      }),
    ]);

    res.json({
      organization,
      services,
      incidents,
      maintenances,
    });

  } catch (error) {
    next(error);
  }
};
