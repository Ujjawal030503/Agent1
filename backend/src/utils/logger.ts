import { inspect } from 'util';

// Log levels enum
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SILENT = 'silent'
}

// Logger configuration interface
export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  includeTimestamp: boolean;
  includeLevel: boolean;
  colorize: boolean;
}

// Default configuration based on environment
function getDefaultConfig(): LoggerConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  
  return {
    level: isProduction ? LogLevel.INFO : (isTest ? LogLevel.SILENT : LogLevel.DEBUG),
    format: isProduction ? 'json' : 'text',
    includeTimestamp: true,
    includeLevel: true,
    colorize: !isProduction
  };
}

// Format arguments for logging
function formatArgs(args: any[]): string {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // Check if it's an error object
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack}`;
      }
      // Pretty print objects
      return inspect(arg, { 
        depth: 5, 
        colors: false, 
        compact: false 
      });
    }
    return String(arg);
  }).join(' ');
}

// Format log message with timestamp and level
function formatMessage(level: string, message: string, config: LoggerConfig): string {
  const parts: string[] = [];
  
  if (config.includeTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }
  
  if (config.includeLevel) {
    parts.push(`[${level.toUpperCase()}]`);
  }
  
  parts.push(message);
  
  return parts.join(' ');
}

// Colorize output for terminal
function colorize(level: string, message: string, colorize: boolean): string {
  if (!colorize) return message;
  
  const colors: Record<string, string> = {
    debug: '\x1b[36m',  // Cyan
    info: '\x1b[32m',   // Green
    warn: '\x1b[33m',   // Yellow
    error: '\x1b[31m',  // Red
    reset: '\x1b[0m'
  };
  
  const color = colors[level.toLowerCase()] || colors.reset;
  return `${color}${message}${colors.reset}`;
}

// Main Logger class
export class Logger {
  public readonly config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...getDefaultConfig(), ...config };
  }

  // Helper to check if a level should be logged
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }

  // Create log entry
  private log(level: LogLevel, args: any[]): void {
    if (!this.shouldLog(level)) return;
    
    const message = formatArgs(args);
    const formatted = formatMessage(level, message, this.config);
    const colored = colorize(level, formatted, this.config.colorize);
    
    if (this.config.format === 'json') {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        message: message
      }));
    } else {
      console.log(colored);
    }
  }

  debug(...args: any[]): void {
    this.log(LogLevel.DEBUG, args);
  }

  info(...args: any[]): void {
    this.log(LogLevel.INFO, args);
  }

  warn(...args: any[]): void {
    this.log(LogLevel.WARN, args);
  }

  error(...args: any[]): void {
    this.log(LogLevel.ERROR, args);
  }

  // Log SQL queries with proper formatting
  sql(query: string, params?: any[]): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const message = params && params.length > 0 
      ? `SQL: ${query} | Params: ${JSON.stringify(params)}`
      : `SQL: ${query}`;
    
    const formatted = formatMessage('sql', message, this.config);
    console.log(colorize('debug', formatted, this.config.colorize));
  }

  // Log HTTP requests
  http(method: string, url: string, status: number, duration?: number): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const durationStr = duration ? ` | ${duration}ms` : '';
    const message = `${method} ${url} | ${status}${durationStr}`;
    
    const formatted = formatMessage('http', message, this.config);
    console.log(colorize('info', formatted, this.config.colorize));
  }
}

// Global logger instance
export const logger = new Logger();

// Shortcut functions for convenience
export const log = {
  debug: (...args: any[]) => logger.debug(...args),
  info: (...args: any[]) => logger.info(...args),
  warn: (...args: any[]) => logger.warn(...args),
  error: (...args: any[]) => logger.error(...args),
  sql: (query: string, params?: any[]) => logger.sql(query, params),
  http: (method: string, url: string, status: number, duration?: number) => 
    logger.http(method, url, status, duration),
  child: (namespace: string) => new Logger({
    ...logger.config,
    // Add namespace to output for child loggers
    includeLevel: true
  })
};

export default logger;