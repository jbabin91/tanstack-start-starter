import pino from 'pino';

// Configure the logger with appropriate options
export const logger = pino({
  // Add base properties to all logs
  base: {
    env: process.env.NODE_ENV,
  },

  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Redact sensitive information
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },

  transport: {
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
    target: 'pino-pretty',
  },
});
