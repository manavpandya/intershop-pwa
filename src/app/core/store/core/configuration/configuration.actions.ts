import { createAction, props } from '@ngrx/store';

import { HttpError } from 'ish-core/models/http-error/http-error.model';

import { ConfigurationState } from './configuration.reducer';
type ConfigurationType = Partial<ConfigurationState>;
export const loadServerConfig = createAction('[Configuration Internal] Get the ICM configuration');

export const loadServerConfigFail = createAction(
  '[Configuration API] Get the ICM configuration Fail',
  props<{ payload: { error: HttpError } }>()
);

export const applyConfiguration = createAction(
  '[Configuration] Apply Configuration',
  props<{ payload: ConfigurationType }>()
);

export const setGTMToken = createAction(
  '[Configuration] Set Google Tag Manager Token',
  props<{ payload: { gtmToken: string } }>()
);
