import { logger } from './logger';

interface ErrorContext {
  userId?: string;
  projectId?: string;
  documentId?: string;
  endpoint?: string;
  [key: string]: unknown;
}

export function captureException(error: Error | unknown, context?: ErrorContext) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error('Exception captured', {
    error: errorMessage,
    stack,
    ...context,
  });

  if (process.env.SENTRY_DSN && typeof window !== 'undefined') {
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error, { extra: context });
    } catch (sentryError) {
      logger.warn('Sentry not configured', { error: sentryError });
    }
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
  logger[level === 'warning' ? 'warn' : level](message, context);

  if (process.env.SENTRY_DSN && typeof window !== 'undefined') {
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureMessage(message, { level, extra: context });
    } catch (sentryError) {
      logger.warn('Sentry not configured', { error: sentryError });
    }
  }
}

export function setUserContext(userId: string, email?: string) {
  if (process.env.SENTRY_DSN && typeof window !== 'undefined') {
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.setUser({ id: userId, email });
    } catch (sentryError) {
      logger.warn('Sentry not configured');
    }
  }
}

