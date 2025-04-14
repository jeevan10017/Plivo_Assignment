import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { emitIncidentEvent } from '../sockets/emitter.js';
import { notifySubscribers } from '../utils/notification.js';
import logger from '../utils/logger.js';


export const getIncidents = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {
      organizationId: req.organizationId,
    };

    if (status) {
      where.status = status;
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        services: { include: { service: true } },
        updates: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ incidents });
  } catch (error) {
    next(error);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
      where: {
        id,
        organizationId: req.organizationId,
      },
      include: {
        services: { include: { service: true } },
        updates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    res.status(200).json({ incident });
  } catch (error) {
    next(error);
  }
};

export const createIncident = async (req, res, next) => {
  try {

    const { title, status, impact, serviceIds, message } = req.body;

    if (!title || !status || !impact || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0 || !message) {
      throw new AppError('Missing required fields: title, status, impact, serviceIds, message', 400);
    }

    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId: req.organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new AppError('One or more services are invalid', 400);
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userClerkId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }


    const incident = await prisma.$transaction(async (prisma) => {
      // 1. Create the incident without nested services first
      const incident = await prisma.incident.create({
        data: {
          title,
          status,
          impact,
          organization: { connect: { id: req.organizationId } },
          createdBy: { connect: { id: user.id } }
        },
      });

      // 2. Bulk create incident-service relationships
      await prisma.incidentService.createMany({
        data: serviceIds.map(serviceId => ({
          incidentId: incident.id,
          serviceId: serviceId
        })),
        skipDuplicates: true,
      });

   
      await prisma.incidentUpdate.create({
        data: {
          status,
          message,
          user: { connect: { clerkId: req.userClerkId } },
          incident: { connect: { id: incident.id } },
        },
      });


      let newStatus;
      switch (impact) {
        case 'CRITICAL':
        case 'MAJOR':
          newStatus = 'OUTAGE';
          break;
        case 'MINOR':
          newStatus = 'DEGRADED';
          break;
        case 'MAINTENANCE':
          newStatus = 'MAINTENANCE';
          break;
        default:
          newStatus = 'DEGRADED';
      }
      await prisma.service.updateMany({
        where: {
          id: { in: serviceIds }
        },
        data: { status: newStatus }
      });

      return prisma.incident.findUnique({
        where: { id: incident.id },
        include: { services: { include: { service: true } } }
      });
    }, {
 
      timeout: 15000
    });
    const completeIncident = await prisma.incident.findUnique({
      where: { id: incident.id },
      include: {
        services: { include: { service: true } },
        updates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    emitIncidentEvent('incident:created', completeIncident);

    try {
      await notifySubscribers(req.organizationId, {
        type: 'INCIDENT_CREATED',
        incident: completeIncident,
      });
    } catch (error) {
      logger.error('Failed to notify subscribers', { error });
    }

    res.status(201).json({ incident: completeIncident });
  } catch (error) {
    next(error);
  }
};

export const updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, impact, serviceIds } = req.body;

    if (!title && impact === undefined && (!serviceIds || !Array.isArray(serviceIds))) {
      throw new AppError('No valid update fields provided', 400);
    }

    const existingIncident = await prisma.incident.findUnique({
      where: { id, organizationId: req.organizationId },
      include: { services: true },
    });

    if (!existingIncident) {
      throw new AppError('Incident not found', 404);
    }

    const incident = await prisma.$transaction(async (prisma) => {
      let incident = existingIncident;
      const updateData = {};

      if (title) updateData.title = title;
      if (impact) updateData.impact = impact;

      if (Object.keys(updateData).length > 0) {
        incident = await prisma.incident.update({
          where: { id },
          data: updateData,
          include: {
            services: { include: { service: true } },
          },
        });
      }

      if (serviceIds && Array.isArray(serviceIds)) {
        const services = await prisma.service.findMany({
          where: {
            id: { in: serviceIds },
            organizationId: req.organizationId,
          },
        });

        if (services.length !== serviceIds.length) {
          throw new AppError('One or more services are invalid', 400);
        }

        await prisma.incidentService.deleteMany({ where: { incidentId: id } });
        await prisma.incidentService.createMany({
          data: serviceIds.map(serviceId => ({ incidentId: id, serviceId })),
        });

        for (const service of services) {
          let newStatus;
          switch (incident.impact) {
            case 'CRITICAL':
            case 'MAJOR':
              newStatus = 'OUTAGE';
              break;
            case 'MINOR':
              newStatus = 'DEGRADED';
              break;
            case 'MAINTENANCE':
              newStatus = 'MAINTENANCE';
              break;
            default:
              newStatus = 'DEGRADED';
          }

          await prisma.service.update({
            where: { id: service.id },
            data: { status: newStatus },
          });
        }
      }

      return incident;
    });

    const completeIncident = await prisma.incident.findUnique({
      where: { id },
      include: {
        services: { include: { service: true } },
        updates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    emitIncidentEvent('incident:updated', completeIncident);

    res.status(200).json({ incident: completeIncident });
  } catch (error) {
    next(error);
  }
};

export const addIncidentUpdate = async (req, res, next) => {
  try {
    if (!allowedStatusTransitions[existingIncident.status].includes(status)) {
      throw new AppError(`Invalid status transition from ${existingIncident.status} to ${status}`, 400);
    }

    const serviceStatusMap = {
      'CRITICAL': 'OUTAGE',
      'MAJOR': 'OUTAGE',
      'MINOR': 'DEGRADED',
      'MAINTENANCE': 'MAINTENANCE'
    };

    await prisma.service.updateMany({
      where: { id: { in: serviceIds } },
      data: { status: serviceStatusMap[impact] }
    });
  } catch (error) {
    next(error);
  }
}

export const deleteIncident = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({
      where: { id, organizationId: req.organizationId },
      include: {
        services: { include: { service: true } },
      },
    });

    if (!incident) {
      throw new AppError('Incident not found', 404);
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.incident.delete({ where: { id } });

      for (const serviceRelation of incident.services) {
        await prisma.service.update({
          where: { id: serviceRelation.service.id },
          data: { status: 'OPERATIONAL' },
        });
      }
    });

    emitIncidentEvent('incident:deleted', id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getPublicIncidents = async (req, res, next) => {
  try {
    const { orgSlug } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: { settings: true },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    const activeIncidents = await prisma.incident.findMany({
      where: {
        organizationId: organization.id,
        status: {
          in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING'],
        },
      },
      include: {
        services: { include: { service: true } },
        updates: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let resolvedIncidents = [];
    if (organization.settings?.showHistory) {
      resolvedIncidents = await prisma.incident.findMany({
        where: {
          organizationId: organization.id,
          status: 'RESOLVED',
        },
        take: 10,
        include: {
          services: { include: { service: true } },
          updates: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({
      activeIncidents,
      resolvedIncidents,
      showHistory: organization.settings?.showHistory || false,
    });
  } catch (error) {
    next(error);
  }
};
