import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Basic console logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info', can be configured via env
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message.trim()} ${info.stack ? '\n' + info.stack : ''}`)
  ),
  transports: [
    new winston.transports.Console(),
    // In a real application, you might add transports for files or logging services:
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message.trim()} ${info.stack ? '\n' + info.stack : ''}`)
      )
    })
  ],
  rejectionHandlers: [
     new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message.trim()} ${info.stack ? '\n' + info.stack : ''}`)
      )
    })
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

export default logger;
