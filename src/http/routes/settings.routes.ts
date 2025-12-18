import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { requireUser } from '../middleware/auth';
import { fetchSettings, saveSettings } from '../../services/profile';
import { settingsResponse, settingsUpdateRequest } from '../contracts/v1/settings';

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
    const payload =
      settings ??
      ({
        userId: req.user!.userId,
        remindersEnabledMeals: false,
        remindersEnabledBodyCheckin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    res.json(
      settingsResponse.parse({
        reminders_enabled_meals: payload.remindersEnabledMeals,
        reminders_enabled_body_checkin: payload.remindersEnabledBodyCheckin
      })
    );
  };

  /**
   * Update reminder settings.
   */
  const handleUpdateReminders: RequestHandler = async (req, res) => {
    const input = settingsUpdateRequest.parse(req.body);
    const updated = await saveSettings(
      { db: deps.db },
      {
        userId: req.user!.userId,
        remindersEnabledMeals: input.reminders_enabled_meals ?? false,
        remindersEnabledBodyCheckin: input.reminders_enabled_body_checkin ?? false
      }
    );
    res.json(
      settingsResponse.parse({
        reminders_enabled_meals: updated.remindersEnabledMeals,
        reminders_enabled_body_checkin: updated.remindersEnabledBodyCheckin
      })
    );
  };

  router.get('/settings', requireUser(), asyncHandler(handleGetSettings));
  router.put(
    '/settings/reminders',
    requireUser(),
    asyncHandler(handleUpdateReminders)
  );

  return router;
};

