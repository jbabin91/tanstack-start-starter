import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'info' : 'silent',
  transport: isDev
    ? {
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          levelFirst: true,
          translateTime: 'SYS:standard',
        },
        target: 'pino-pretty',
      }
    : undefined,
});
