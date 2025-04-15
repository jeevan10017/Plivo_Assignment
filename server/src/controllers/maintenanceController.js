import { MaintenanceStatus } from '@prisma/client';
import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitMaintenanceEvent } from '../sockets/emitter.js';

export const  getMaintenances = async (req, res, next) => {
  try {
    const { status } = req.query;

    const whereClause = {
      organizationId: req.organizationId,
    };

    if (status && Object.values(MaintenanceStatus).includes(status)) {
      whereClause.status = status;
    }

    const maintenances = await prisma.maintenance.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        updates: true,
        organization: true,
      },
      orderBy: [
        { scheduledStart: 'desc' },
      ],
    });

    res.status(200).json({ maintenances });
  } catch (error) {
    next(error);
  }
};

export const  getUpcomingMaintenances = async (req, res, next) => {
  try {
    const maintenances = await prisma.maintenance.findMany({
      where: {
        organizationId: req.organizationId,
        status: {
          in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
        },
        scheduledStart: {
          // gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        scheduledStart: 'asc',
      },
    });

    res.status(200).json({ maintenances });
  } catch (error) {
    next(error);
  }
};

export const  getMaintenanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.maintenance.findUnique({
      where: {
        id,
        organizationId: req.organizationId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        updates: true,
        organization: true,
      },
    });

    if (!maintenance) {
      throw new AppError('Maintenance not found', 404);
    }

    res.status(200).json({ maintenance });
  } catch (error) {
    next(error);
  }
};

export const  createMaintenance = async (req, res, next) => {
  try {
    const { title,  scheduledStart, scheduledEnd, serviceIds } = req.body;

    if (!title ||  !scheduledStart || !scheduledEnd) {
      throw new AppError('Missing required fields', 400);
    }

    if (new Date(scheduledStart) >= new Date(scheduledEnd)) {
      throw new AppError('End time must be after start time', 400);
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      throw new AppError('At least one service must be affected', 400);
    }

    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        organizationId: req.organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new AppError('One or more services not found', 404);
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        title,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        status: MaintenanceStatus.SCHEDULED,
        createdBy: {
         connect: { clerkId: req.userClerkId } 
        },
        organization: {
          connect: { id: req.organizationId },
        },
        services: {
          create: serviceIds.map(serviceId => ({
            service: {
              connect: { id: serviceId },
            },
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    emitMaintenanceEvent('maintenance:created', maintenance);

    res.status(201).json({ maintenance });
  } catch (error) {
    next(error);
  }
};

export const  updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title,  scheduledStart, scheduledEnd, serviceIds } = req.body;

    if (!title || !scheduledStart || !scheduledEnd) {
      throw new AppError('Missing required fields', 400);
    }

    if (new Date(scheduledStart) >= new Date(scheduledEnd)) {
      throw new AppError('End time must be after start time', 400);
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      throw new AppError('At least one service must be affected', 400);
    }

    const existingMaintenance = await prisma.maintenance.findUnique({
      where: {
        id,
        organizationId: req.organizationId,
      },
      include: {
        services: true,
      },
    });

    if (!existingMaintenance) {
      throw new AppError('Maintenance not found', 404);
    }

    if ([MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED].includes(existingMaintenance.status)) {
      throw new AppError('Cannot update completed or cancelled maintenance', 400);
    }

    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        organizationId: req.organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new AppError('One or more services not found', 404);
    }

    const existingServiceIds = existingMaintenance.services.map(s => s.serviceId);

    const servicesToConnect = serviceIds.filter(id => !existingServiceIds.includes(id));
    const servicesToDisconnect = existingServiceIds.filter(id => !serviceIds.includes(id));

    const updatedMaintenance = await prisma.maintenance.update({
      where: { id },
      data: {
        title,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        services: {
          deleteMany: servicesToDisconnect.length > 0
            ? { serviceId: { in: servicesToDisconnect } }
            : undefined,
          create: servicesToConnect.map(serviceId => ({
            service: {
              connect: { id: serviceId },
            },
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    emitMaintenanceEvent('maintenance:updated', updatedMaintenance);

    res.status(200).json({ maintenance: updatedMaintenance });
  } catch (error) {
    next(error);
  }
};

export const  updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(MaintenanceStatus).includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const allowedTransitions = {
      [MaintenanceStatus.SCHEDULED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],
      [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED],
      [MaintenanceStatus.COMPLETED]: [],
      [MaintenanceStatus.CANCELLED]: []
    };

    if (!allowedTransitions[existingMaintenance.status].includes(status)) {
      throw new AppError(`Invalid status transition from ${existingMaintenance.status} to ${status}`, 400);
    }

    const existingMaintenance = await prisma.maintenance.findUnique({
      where: {
        id,
        organizationId: req.organizationId,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!existingMaintenance) {
      throw new AppError('Maintenance not found', 404);
    }

    const additionalData = {};

    if (status === MaintenanceStatus.IN_PROGRESS) {
      additionalData.startedAt = new Date();

      await Promise.all(
        existingMaintenance.services.map(({ serviceId }) =>
          prisma.service.update({
            where: { id: serviceId },
            data: { status: 'DEGRADED' },
          })
        )
      );
    } else if ([MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED].includes(status)) {
      additionalData.endedAt = new Date();

      await Promise.all(
        existingMaintenance.services.map(({ serviceId }) =>
          prisma.service.update({
            where: { id: serviceId },
            data: { status: 'OPERATIONAL' },
          })
        )
      );
    }

    const updatedMaintenance = await prisma.maintenance.update({
      where: { id },
      data: {
        status,
        ...additionalData,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    emitMaintenanceEvent('maintenance:status_updated', id, status);

    res.status(200).json({ maintenance: updatedMaintenance });
  } catch (error) {
    next(error);
  }
};

export const  deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingMaintenance = await prisma.maintenance.findUnique({
      where: {
        id,
        organizationId: req.organizationId,
      },
      include: {
        services: true,
      },
    });

    if (!existingMaintenance) {
      throw new AppError('Maintenance not found', 404);
    }

    if (existingMaintenance.status === MaintenanceStatus.IN_PROGRESS) {
      await Promise.all(
        existingMaintenance.services.map(({ serviceId }) =>
          prisma.service.update({
            where: { id: serviceId },
            data: { status: 'OPERATIONAL' },
          })
        )
      );
    }

    await prisma.maintenance.delete({
      where: { id },
    });

    emitMaintenanceEvent('maintenance:deleted', id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


export const getPublicMaintenances = async (req, res, next) => {
  try {
    const { orgSlug } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug }
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    const maintenances = await prisma.maintenance.findMany({
      where: {
        organizationId: organization.id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        services: { some: { service: { isPublic: true } } }
      },
      include: {
        services: {
          include: { service: { select: { id: true, name: true } } },
          where: { service: { isPublic: true } }
        }
      },
      orderBy: { scheduledStart: 'asc' }
    });

    res.status(200).json({ maintenances });
  } catch (error) {
    next(error);
  }
};