import { env } from '../../config/environment';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private readonly service: string;

  private constructor(service: string) {
    this.service = service;
  }

  static getInstance(service: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(service);
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        service: this.service,
        environment: env.NODE_ENV,
        ...context,
      },
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logMessage = this.formatMessage(level, message, context);

    if (env.isProduction) {
      console[level](JSON.stringify(logMessage));
    } else {
      const { timestamp, level: msgLevel, message: msg, context: ctx } = logMessage;
      console[level](
        `[${timestamp}] ${msgLevel.toUpperCase()} [${this.service}]: ${msg}`,
        ctx ? '\nContext:' : '',
        ctx || ''
      );
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    });
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!env.isProduction) {
      this.log('debug', message, context);
    }
  }

  // Helper method for HTTP request logging
  logRequest(req: any, res: any, duration: number): void {
    this.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  // Helper method for error logging
  logError(error: Error, context?: Record<string, any>): void {
    this.error('Error occurred', error, context);
  }
}
