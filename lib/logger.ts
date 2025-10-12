import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mistral-rag' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export function logApiError(
  endpoint: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  logger.error('API Error', {
    endpoint,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}

export function logDocumentProcessing(
  action: string,
  documentId: string,
  details?: Record<string, unknown>
) {
  logger.info('Document Processing', {
    action,
    documentId,
    ...details,
  });
}

