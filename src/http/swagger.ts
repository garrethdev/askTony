import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { API_PREFIX } from '../config/constants';

const secure = { security: [{ bearerAuth: [] }] };

const jsonBody = (description: string, schema: Record<string, unknown> = { type: 'object' }) => ({
  description,
  required: true,
  content: { 'application/json': { schema } }
});

/**
 * Static OpenAPI 3 document for the AskTony API.
 */
const swaggerDocument: any = {
  openapi: '3.0.3',
  info: {
    title: 'AskTony API',
    version: '1.0.0',
    description: 'REST API for nutrition coaching: auth, onboarding, meals, scoring, progress, community.'
  },
  servers: [
    {
      url: `http://localhost:3000${API_PREFIX}`,
      description: 'Local dev'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      StandardError: {
        type: 'object',
        properties: { message: { type: 'string' } }
      }
    }
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account',
        requestBody: jsonBody('email, password, nickname, username, avatar_id, timezone'),
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        requestBody: jsonBody('email and password'),
        responses: { 200: { description: 'Tokens and user session' }, 401: { description: 'Invalid credentials' } }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Stateless logout',
        ...secure,
        responses: { 200: { description: 'Logged out' } }
      }
    },
    '/auth/session': {
      get: {
        tags: ['Auth'],
        summary: 'Return current session user',
        ...secure,
        responses: { 200: { description: 'User session' } }
      }
    },
    '/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Get current profile',
        ...secure,
        responses: { 200: { description: 'Profile' }, 404: { description: 'Not found' } }
      },
      put: {
        tags: ['Profile'],
        summary: 'Update profile fields',
        ...secure,
        requestBody: jsonBody('nickname, username, avatar_id, timezone'),
        responses: { 200: { description: 'Updated profile' } }
      }
    },
    '/settings': {
      get: {
        tags: ['Settings'],
        summary: 'Get reminder settings',
        ...secure,
        responses: { 200: { description: 'Reminder flags' } }
      }
    },
    '/settings/reminders': {
      put: {
        tags: ['Settings'],
        summary: 'Update reminder toggles',
        ...secure,
        requestBody: jsonBody('reminders_enabled_meals, reminders_enabled_body_checkin'),
        responses: { 200: { description: 'Updated settings' } }
      }
    },
    '/catalog/tags': {
      get: {
        tags: ['Catalog'],
        summary: 'List available tags',
        responses: { 200: { description: 'Tag catalog' } }
      }
    },
    '/catalog/onboarding': {
      get: {
        tags: ['Catalog'],
        summary: 'Static onboarding options',
        responses: { 200: { description: 'Lists reasons, challenges, eating patterns' } }
      }
    },
    '/onboarding': {
      get: {
        tags: ['Onboarding'],
        summary: 'Read onboarding state',
        ...secure,
        responses: { 200: { description: 'Onboarding data' } }
      }
    },
    '/onboarding/main-reason': {
      put: {
        tags: ['Onboarding'],
        summary: 'Set main reason key',
        ...secure,
        requestBody: jsonBody('main_reason_key'),
        responses: { 200: { description: 'Updated reason' } }
      }
    },
    '/onboarding/challenges': {
      put: {
        tags: ['Onboarding'],
        summary: 'Set main challenges keys',
        ...secure,
        requestBody: jsonBody('main_challenges_keys[]'),
        responses: { 200: { description: 'Updated challenges' } }
      }
    },
    '/onboarding/eating-pattern': {
      put: {
        tags: ['Onboarding'],
        summary: 'Set eating pattern key',
        ...secure,
        requestBody: jsonBody('eating_pattern_key'),
        responses: { 200: { description: 'Updated eating pattern' } }
      }
    },
    '/onboarding/complete': {
      post: {
        tags: ['Onboarding'],
        summary: 'Mark onboarding complete',
        ...secure,
        responses: { 200: { description: 'Completion state' } }
      }
    },
    '/cohort/current': {
      get: {
        tags: ['Cohort'],
        summary: 'Get user cohort',
        ...secure,
        responses: { 200: { description: 'Current cohort' }, 404: { description: 'No cohort' } }
      }
    },
    '/cohort/members': {
      get: {
        tags: ['Cohort'],
        summary: 'List members of current cohort',
        ...secure,
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer' }, description: 'Max members' }
        ],
        responses: { 200: { description: 'Cohort members' } }
      }
    },
    '/meal-scans': {
      post: {
        tags: ['Scans'],
        summary: 'Create a meal scan placeholder',
        ...secure,
        responses: { 201: { description: 'Scan created' } }
      },
      get: {
        tags: ['Scans'],
        summary: 'List scans (cursor pagination)',
        ...secure,
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
          { in: 'query', name: 'cursor', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Scans list' } }
      }
    },
    '/meal-scans/{scanId}': {
      get: {
        tags: ['Scans'],
        summary: 'Get a scan by id',
        ...secure,
        parameters: [{ in: 'path', name: 'scanId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Scan detail' } }
      },
      delete: {
        tags: ['Scans'],
        summary: 'Delete a scan',
        ...secure,
        parameters: [{ in: 'path', name: 'scanId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/meal-scans/{scanId}/upload-url': {
      post: {
        tags: ['Scans'],
        summary: 'Request an upload URL',
        ...secure,
        parameters: [{ in: 'path', name: 'scanId', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody('mime_type'),
        responses: { 200: { description: 'Presigned URL' } }
      }
    },
    '/meal-scans/{scanId}/analyze': {
      post: {
        tags: ['Scans'],
        summary: 'Analyze a scan',
        ...secure,
        parameters: [{ in: 'path', name: 'scanId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Analysis result' } }
      }
    },
    '/meals/from-scan': {
      post: {
        tags: ['Meals'],
        summary: 'Create meal from scan',
        ...secure,
        requestBody: jsonBody('scan_id, meal_name, meal_type, eaten_at, energy_level'),
        responses: { 201: { description: 'Meal created' } }
      }
    },
    '/meals/manual': {
      post: {
        tags: ['Meals'],
        summary: 'Create manual meal',
        ...secure,
        requestBody: jsonBody('meal_name, meal_description, meal_type, eaten_at, energy_level'),
        responses: { 201: { description: 'Meal created' } }
      }
    },
    '/meals': {
      get: {
        tags: ['Meals'],
        summary: 'List meals with filters',
        ...secure,
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
          { in: 'query', name: 'cursor', schema: { type: 'string' } },
          { in: 'query', name: 'date', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Search query' }
        ],
        responses: { 200: { description: 'Meals list' } }
      }
    },
    '/meals/{mealId}': {
      get: {
        tags: ['Meals'],
        summary: 'Get meal by id',
        ...secure,
        parameters: [{ in: 'path', name: 'mealId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Meal detail' } }
      },
      delete: {
        tags: ['Meals'],
        summary: 'Delete meal',
        ...secure,
        parameters: [{ in: 'path', name: 'mealId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/scoring/manual-meal': {
      post: {
        tags: ['Scoring'],
        summary: 'Score a manual meal payload',
        ...secure,
        requestBody: jsonBody('meal payload with foods/tags'),
        responses: { 200: { description: 'Score result' } }
      }
    },
    '/scoring/compare': {
      get: {
        tags: ['Scoring'],
        summary: 'Compare score to baseline',
        ...secure,
        parameters: [
          { in: 'query', name: 'entity_type', schema: { type: 'string' }, required: true },
          { in: 'query', name: 'entity_id', schema: { type: 'string' }, required: true },
          { in: 'query', name: 'baseline_days', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Comparison' } }
      }
    },
    '/body-checkins/{date}': {
      put: {
        tags: ['Body Check-ins'],
        summary: 'Upsert energy check-in for a day',
        ...secure,
        parameters: [{ in: 'path', name: 'date', required: true, schema: { type: 'string', format: 'date' } }],
        requestBody: jsonBody('energy_level'),
        responses: { 200: { description: 'Saved check-in' } }
      },
      get: {
        tags: ['Body Check-ins'],
        summary: 'Get energy check-in for a day',
        ...secure,
        parameters: [{ in: 'path', name: 'date', required: true, schema: { type: 'string', format: 'date' } }],
        responses: { 200: { description: 'Check-in' } }
      }
    },
    '/progress/summary': {
      get: {
        tags: ['Progress'],
        summary: 'Progress summary over a window',
        ...secure,
        parameters: [
          { in: 'query', name: 'range', schema: { type: 'string', enum: ['this_week', '30d', '90d'] } },
          { in: 'query', name: 'end_date', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 200: { description: 'Average score, best day, log frequency, insight' } }
      }
    },
    '/progress/calendar': {
      get: {
        tags: ['Progress'],
        summary: 'Calendar daily scores for a month',
        ...secure,
        parameters: [{ in: 'query', name: 'month', schema: { type: 'string' }, description: 'YYYY-MM' }],
        responses: { 200: { description: 'Calendar days' } }
      }
    },
    '/weight/goal': {
      get: {
        tags: ['Weight'],
        summary: 'Get weight goal',
        ...secure,
        responses: { 200: { description: 'Goal weight (kg)' } }
      },
      put: {
        tags: ['Weight'],
        summary: 'Upsert weight goal',
        ...secure,
        requestBody: jsonBody('goal_weight_kg'),
        responses: { 200: { description: 'Saved goal' } }
      }
    },
    '/weight/entries': {
      post: {
        tags: ['Weight'],
        summary: 'Add weight entry',
        ...secure,
        requestBody: jsonBody('weight_kg, measured_at'),
        responses: { 201: { description: 'Entry created' } }
      },
      get: {
        tags: ['Weight'],
        summary: 'List weight entries',
        ...secure,
        parameters: [
          { in: 'query', name: 'from', schema: { type: 'string', format: 'date-time' } },
          { in: 'query', name: 'to', schema: { type: 'string', format: 'date-time' } }
        ],
        responses: { 200: { description: 'Entries' } }
      }
    },
    '/community/reflections': {
      get: {
        tags: ['Community'],
        summary: 'List weekly reflections',
        ...secure,
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
          { in: 'query', name: 'cursor', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Reflections list' } }
      },
      post: {
        tags: ['Community'],
        summary: 'Create a reflection',
        ...secure,
        requestBody: jsonBody('body'),
        responses: { 201: { description: 'Reflection created' } }
      }
    },
    '/community/reflections/{reflectionId}': {
      delete: {
        tags: ['Community'],
        summary: 'Delete a reflection',
        ...secure,
        parameters: [{ in: 'path', name: 'reflectionId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } }
      }
    },
    '/community/meals': {
      get: {
        tags: ['Community'],
        summary: 'List community meals for a week',
        ...secure,
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer' } },
          { in: 'query', name: 'cursor', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Meals list' } }
      }
    },
    '/community/leaderboard': {
      get: {
        tags: ['Community'],
        summary: 'Weekly leaderboard',
        ...secure,
        parameters: [
          { in: 'query', name: 'week_start', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 200: { description: 'Leaderboard' } }
      }
    },
    '/community/reactions/support': {
      post: {
        tags: ['Community'],
        summary: 'Add a support reaction',
        ...secure,
        requestBody: jsonBody('target_type, target_id'),
        responses: { 201: { description: 'Support added' } }
      },
      delete: {
        tags: ['Community'],
        summary: 'Remove a support reaction',
        ...secure,
        parameters: [
          { in: 'query', name: 'target_type', schema: { type: 'string' }, required: true },
          { in: 'query', name: 'target_id', schema: { type: 'string' }, required: true }
        ],
        responses: { 200: { description: 'Support removed' } }
      }
    },
    '/community/users/{username}': {
      get: {
        tags: ['Community'],
        summary: 'View public profile by username',
        ...secure,
        parameters: [{ in: 'path', name: 'username', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User profile' } }
      }
    }
  }
};

/**
 * Wire up Swagger UI and JSON endpoints.
 * @param app Express application instance.
 */
export const setupSwagger = (app: Application): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/docs.json', (_req, res) => res.json(swaggerDocument));
};

export { swaggerDocument };

