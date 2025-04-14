
import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        organizationId: req.organizationId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    res.status(200).json({ services });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId: req.organizationId,
      },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    res.status(200).json({ service });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { name, description, groupName, status, isPublic } = req.body;

    if (!name) {
      throw new AppError('Service name is required', 400);
    }

    // Get the highest sortOrder to place the new service at the end
    const lastService = await prisma.service.findFirst({
      where: {
        organizationId: req.organizationId,
      },
      orderBy: {
        sortOrder: 'desc',
      },
    });

    const nextSortOrder = lastService ? lastService.sortOrder + 1 : 0;

    const service = await prisma.service.create({
      data: {
        name,
        description: description || '',
        groupName,
        status: status || 'OPERATIONAL', 
        isPublic: isPublic === undefined ? true : isPublic,
        sortOrder: nextSortOrder,
        organization: {
          connect: { id: req.organizationId },
        },
      },
    });

    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, groupName, status, isPublic } = req.body;

    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: req.organizationId,
      },
    });

    if (!existingService) {
      throw new AppError('Service not found', 404);
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description === undefined ? undefined : description,
        groupName: groupName === undefined ? undefined : groupName,
        status: status || undefined,
        isPublic: isPublic === undefined ? undefined : isPublic,
      },
    });

    res.status(200).json({ service });
  } catch (error) {
    next(error);
  }
};

export const updateServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: req.organizationId,
      },
    });

    if (!existingService) {
      throw new AppError('Service not found', 404);
    }
    const [updatedService] = await prisma.$transaction([
      prisma.service.update({
        where: { id },
        data: { status },
      }),
      prisma.serviceStatusHistory.create({
        data: {
          status,
          serviceId: id,
          organizationId: req.organizationId,
        },
      }),
    ]);

    res.status(200).json({ service: updatedService });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId: req.organizationId,
      },
    });

    if (!existingService) {
      throw new AppError('Service not found', 404);
    }

    await prisma.service.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


export const getPublicServices = async (req, res, next) => {
  try {
    const { orgSlug } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: { settings: true }
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    const services = await prisma.service.findMany({
      where: {
        organizationId: organization.id,
        isPublic: true
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        groupName: true,
        statusHistories: {
          where: {
            organizationId: organization.id
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            status: true,
            createdAt: true
          }
        }
      }
    });

    res.status(200).json({ 
      organization: {
        name: organization.name,
        logoUrl: organization.settings?.logoUrl
      },
      services: services.map(service => ({
        ...service,
        statusHistory: service.statusHistories
      }))
    });
  } catch (error) {
    next(error);
  }
};