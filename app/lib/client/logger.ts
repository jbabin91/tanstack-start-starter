// Client-side logger that mirrors Pino's API
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogFn = (msg: string, data?: Record<string, unknown>) => void;

type Logger = {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  child: (bindings: Record<string, unknown>) => Logger;
  enable: () => void;
  disable: () => void;
  setLevel: (level: LogLevel) => void;
};

type LoggerConfig = {
  enabled?: boolean;
  level?: LogLevel;
};

// Default to enabled in development, disabled in production
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: import.meta.env.DEV,
  level: import.meta.env.PROD ? 'error' : 'debug',
};

// Allow override through environment variable
const ENV_CONFIG: LoggerConfig = {
  enabled: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  level: import.meta.env.VITE_LOG_LEVEL as LogLevel,
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  error: 3,
  info: 1,
  warn: 2,
};

function formatMessage(
  level: LogLevel,
  msg: string,
  data?: Record<string, unknown>,
) {
  return {
    level,
    msg,
    timestamp: new Date().toISOString(),
    ...data,
  };
}

function createLogger(
  baseBindings: Record<string, unknown> = {},
  config: LoggerConfig = {},
): Logger {
  const currentConfig: LoggerConfig = {
    ...DEFAULT_CONFIG,
    ...ENV_CONFIG,
    ...config,
  };

  function shouldLog(level: LogLevel): boolean {
    if (!currentConfig.enabled) return false;
    const configLevel = currentConfig.level ?? 'info';
    return LOG_LEVELS[level] >= LOG_LEVELS[configLevel];
  }

  const debug: LogFn = (msg, data) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', msg, { ...baseBindings, ...data }));
    }
  };

  const info: LogFn = (msg, data) => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', msg, { ...baseBindings, ...data }));
    }
  };

  const warn: LogFn = (msg, data) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', msg, { ...baseBindings, ...data }));
    }
  };

  const error: LogFn = (msg, data) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', msg, { ...baseBindings, ...data }));
    }
  };

  const child = (bindings: Record<string, unknown>) => {
    return createLogger({ ...baseBindings, ...bindings }, currentConfig);
  };

  const enable = () => {
    currentConfig.enabled = true;
  };

  const disable = () => {
    currentConfig.enabled = false;
  };

  const setLevel = (level: LogLevel) => {
    currentConfig.level = level;
  };

  return {
    child,
    debug,
    disable,
    enable,
    error,
    info,
    setLevel,
    warn,
  };
}

export const logger = createLogger();
