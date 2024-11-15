import colors from 'ansi-colors';

type Method = 'info' | 'warn' | 'error' | 'success' | 'loading';

const DISABLE_IN_PRODUCTION = false;

const APP_NAME = colors.cyan.bold(` [${import.meta.env.VITE_APP_NAME}] `);

const prefixes: Record<Method, string> = {
  error: colors.red('[ERROR]'),
  info: colors.white('[INFO]'),
  loading: colors.magenta('[LOADING]'),
  success: colors.green('[SUCCESS]'),
  warn: colors.yellow('[WARN]'),
};

const methods: Record<Method, 'log' | 'error'> = {
  error: 'error',
  info: 'log',
  loading: 'log',
  success: 'log',
  warn: 'error',
};

const logger: Record<Method, (...message: unknown[]) => void> = {
  error: loggerFactory('error'),
  info: loggerFactory('info'),
  loading: loggerFactory('loading'),
  success: loggerFactory('success'),
  warn: loggerFactory('warn'),
};

function loggerFactory(method: Method) {
  return (...message: unknown[]) => {
    if (DISABLE_IN_PRODUCTION && import.meta.env.PROD) return;

    const consoleLogger = console[methods[method]];
    const prefix = `${APP_NAME}${prefixes[method]}`;

    consoleLogger(prefix, ...message);
  };
}

export { logger };
