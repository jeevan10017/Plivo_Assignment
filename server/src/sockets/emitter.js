import { io } from 'socket.io';
import logger from '../utils/logger.js';

export const emitIncidentEvent = (event, data, additionalData) => {
  try {
    if (data?.organizationId) {
      // Emit to organization room
      io.to(`org:${data.organizationId}`).emit(
        event,
        additionalData ? { incident: data, additionalData } : data
      );

      io.to(`public:${data.organizationId}`).emit(
        event,
        sanitizeForPublic(event, data, additionalData)
      );
    } else if (typeof data === 'string') {
      io.emit(event, data);
    }
  } catch (error) {
    logger.error('Failed to emit incident event', { event, error });
  }
};

export const emitMaintenanceEvent = (event, data, additionalData) => {
  try {
    if (data?.organizationId) {
     
      io.to(`org:${data.organizationId}`).emit(
        event,
        additionalData ? { maintenance: data, additionalData } : data
      );


      io.to(`public:${data.organizationId}`).emit(
        event,
        sanitizeForPublic(event, data, additionalData)
      );
    } else if (typeof data === 'string') {

      io.emit(event, data);
    }
  } catch (error) {
    logger.error('Failed to emit maintenance event', { event, error });
  }
};

export const emitServiceEvent = (event, data) => {
  try {
    if (data?.organizationId) {
      io.to(`org:${data.organizationId}`).emit(event, data);


      if (
        event === 'service:status_changed' ||
        event === 'service:updated'
      ) {
        io.to(`public:${data.organizationId}`).emit(
          event,
          sanitizeForPublic(event, data)
        );
      }
    } else if (typeof data === 'string') {
      io.emit(event, data);
    }
  } catch (error) {
    logger.error('Failed to emit service event', { event, error });
  }
};

function sanitizeForPublic(event, data, additionalData) {
  const clonedData = JSON.parse(JSON.stringify(data));

  if (clonedData.updates) {
    clonedData.updates = clonedData.updates.map((update) => {
      const { user, ...rest } = update;
      return {
        ...rest,
        user: user ? { name: user.name } : null,
      };
    });
  }

  if (additionalData) {
    const clonedAdditional = JSON.parse(JSON.stringify(additionalData));

    if (clonedAdditional.user) {
      clonedAdditional.user = { name: clonedAdditional.user.name };
    }

    return {
      [event.includes('incident') ? 'incident' : 'maintenance']: clonedData,
      additionalData: clonedAdditional,
    };
  }

  return clonedData;
}
