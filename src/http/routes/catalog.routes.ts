import { Router, RequestHandler } from 'express';
import { RouteDeps } from './context';
import { asyncHandler } from './helpers';
import { catalogTagsResponse, catalogOnboardingResponse } from '../contracts/v1/catalog';
import { listTags } from '../../db/queries/catalog';

const ONBOARDING_OPTIONS = {
  main_reasons: ['health', 'energy', 'digestion'],
  challenges: ['time', 'cost', 'motivation'],
  eating_patterns: ['omnivore', 'vegetarian', 'vegan', 'pescatarian']
};

/**
 * Catalog routes.
 * @param deps - Route dependencies.
 */
export const catalogRoutes = (deps: RouteDeps): Router => {
  const router = Router();

  const handleTags: RequestHandler = async (_req, res) => {
    const tags = await listTags(deps.db);
    res.json(catalogTagsResponse.parse({ tags }));
  };

  const handleOnboarding: RequestHandler = async (_req, res) => {
    res.json(catalogOnboardingResponse.parse(ONBOARDING_OPTIONS));
  };

  router.get('/catalog/tags', asyncHandler(handleTags));
  router.get('/catalog/onboarding', asyncHandler(handleOnboarding));

  return router;
};

