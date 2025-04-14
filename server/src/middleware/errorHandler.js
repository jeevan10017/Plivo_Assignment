import logger from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const isOperational = 'isOperational' in err ? err.isOperational : false;

  // Log error
  if (statusCode === 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn({
      message: err.message,
      path: req.path,
      method: req.method,
    });
  }

  
  const response = {
    status: 'error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && !isOperational
      ? { stack: err.stack }
      : {}),
  };

  res.status(statusCode).json(response);
};
