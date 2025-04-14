import { prisma } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';

exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      serviceCount,
      activeIncidentCount,
      totalIncidentCount,
      upcomingMaintenanceCount,
      subscriberCount
    ] = await Promise.all([
      prisma.service.count({
        where: { organizationId: req.organizationId }
      }),
      prisma.incident.count({
        where: {
          organizationId: req.organizationId,
          status: {
            in: ['INVESTIGATING', 'IDENTIFIED', 'MONITORING']
          }
        }
      }),
      prisma.incident.count({
        where: { organizationId: req.organizationId }
      }),
      prisma.maintenance.count({
        where: {
          organizationId: req.organizationId,
          status: 'SCHEDULED',
          scheduledStart: {
            gte: new Date()
          }
        }
      }),
      prisma.subscriber.count({
        where: {
          organizationId: req.organizationId,
          verified: true
        }
      })
    ]);

    const serviceStatuses = await prisma.service.groupBy({
      by: ['status'],
      where: {
        organizationId: req.organizationId
      },
      _count: {
        status: true
      }
    });

    const statusCounts = serviceStatuses.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const recentIncidents = await prisma.incident.findMany({
      where: {
        organizationId: req.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const incidentsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "Incident"
      WHERE "organizationId" = ${req.organizationId}
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const metrics = {
      counts: {
        services: serviceCount,
        activeIncidents: activeIncidentCount,
        totalIncidents: totalIncidentCount,
        upcomingMaintenance: upcomingMaintenanceCount,
        subscribers: subscriberCount
      },
      serviceStatuses: statusCounts,
      recentIncidents,
      incidentsByMonth
    };

    res.status(200).json({ metrics });
  } catch (error) {
    next(error);
  }
};

exports.getServiceAvailability = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { period = '30d' } = req.query;

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        organizationId: req.organizationId,
      },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '14d':
        startDate.setDate(startDate.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const incidents = await prisma.incident.findMany({
      where: {
        services: {
          some: {
            serviceId,
          },
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        updates: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    let totalDowntimeMinutes = 0;

    incidents.forEach(incident => {
      const end = incident.resolvedAt ? incident.resolvedAt.getTime() : new Date().getTime();
      const duration = end - incident.createdAt.getTime();
      totalDowntimeMinutes += duration / (1000 * 60);
    });

    const totalPeriodMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    const uptimeMinutes = totalPeriodMinutes - totalDowntimeMinutes;
    const availabilityPercentage = (uptimeMinutes / totalPeriodMinutes) * 100;

    const dailyData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayIncidents = incidents.filter(inc =>
        inc.createdAt <= dayEnd && (!inc.resolvedAt || inc.resolvedAt >= dayStart)
      );

      let dayDowntimeMinutes = 0;

      dayIncidents.forEach(incident => {
        const incidentStart = incident.createdAt < dayStart ? dayStart : incident.createdAt;
        const incidentEnd = !incident.resolvedAt || incident.resolvedAt > dayEnd
          ? dayEnd
          : incident.resolvedAt;

        const duration = incidentEnd.getTime() - incidentStart.getTime();
        dayDowntimeMinutes += duration / (1000 * 60);
      });

      const dayMinutes = 24 * 60;
      const dayAvailability = ((dayMinutes - dayDowntimeMinutes) / dayMinutes) * 100;

      dailyData.push({
        date: currentDate.toISOString().slice(0, 10),
        availability: parseFloat(dayAvailability.toFixed(2)),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      service: {
        id: service.id,
        name: service.name,
      },
      metrics: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        availability: parseFloat(availabilityPercentage.toFixed(2)),
        downtime: {
          minutes: parseFloat(totalDowntimeMinutes.toFixed(2)),
          formatted: formatDowntime(totalDowntimeMinutes),
        },
        incidents: incidents.length,
        dailyData,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOverallUptime = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '14d':
        startDate.setDate(startDate.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const services = await prisma.service.findMany({
      where: {
        organizationId: req.organizationId,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    const incidents = await prisma.incident.findMany({
      where: {
        organizationId: req.organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        updates: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const serviceMetrics = services.map(service => {
      const serviceIncidents = incidents.filter(inc =>
        inc.services.some(s => s.serviceId === service.id)
      );

      let totalDowntimeMinutes = 0;

      serviceIncidents.forEach(incident => {
        const end = incident.resolvedAt ? incident.resolvedAt.getTime() : new Date().getTime();
        const duration = end - incident.createdAt.getTime();
        totalDowntimeMinutes += duration / (1000 * 60);
      });

      const totalPeriodMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      const uptimeMinutes = totalPeriodMinutes - totalDowntimeMinutes;
      const availabilityPercentage = (uptimeMinutes / totalPeriodMinutes) * 100;

      return {
        service: {
          id: service.id,
          name: service.name,
          status: service.status,
        },
        metrics: {
          availability: parseFloat(availabilityPercentage.toFixed(2)),
          incidents: serviceIncidents.length,
          downtime: {
            minutes: parseFloat(totalDowntimeMinutes.toFixed(2)),
            formatted: formatDowntime(totalDowntimeMinutes),
          },
        },
      };
    });

    const overallUptime = serviceMetrics.length > 0
      ? serviceMetrics.reduce((sum, item) => sum + item.metrics.availability, 0) / serviceMetrics.length
      : 100;

    const incidentCount = incidents.length;

    const dailyIncidents = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayIncidents = incidents.filter(inc =>
        inc.createdAt >= dayStart && inc.createdAt <= dayEnd
      );

      dailyIncidents.push({
        date: currentDate.toISOString().slice(0, 10),
        count: dayIncidents.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      metrics: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        overallUptime: parseFloat(overallUptime.toFixed(2)),
        incidentCount,
        services: serviceMetrics,
        dailyIncidents,
      },
    });
  } catch (error) {
    next(error);
  }
};

function formatDowntime(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  } else if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`;
  } else {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    return `${days} day${days > 1 ? 's' : ''} ${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''}`;
  }
}
