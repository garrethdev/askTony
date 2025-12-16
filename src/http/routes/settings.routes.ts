import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchSettings, saveSettings } from '../../services/profile';
import { settingsSchema } from '../validators/settings';

/**
 * Build settings routes.
 * @param deps - Route dependencies.
 */
export const settingsRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  /**
   * Get user settings.
   */
  const handleGetSettings: RequestHandler = async (req, res) => {
    const settings = await fetchSettings({ db: deps.db }, req.user!.userId);
    res.json(settings ?? { remindersEnabled: false });
  };

  /**
   * Update reminder settings.
   */
  const handleUpdateReminders: RequestHandler = async (req, res) => {
    const input = settingsSchema.parse(req.body);
    const updated = await saveSettings(
      { db: deps.db },
      {
        userId: req.user!.userId,
        remindersEnabled: input.remindersEnabled,
        reminderTime: input.reminderTime
      }
    );
    res.json(updated);
  };

  router.get('/settings', requireUser(), asyncHandler(handleGetSettings));
  router.put(
    '/settings/reminders',
    requireUser(),
    asyncHandler(handleUpdateReminders)
  );

  return router;
};

