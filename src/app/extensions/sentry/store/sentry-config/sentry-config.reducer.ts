import { createReducer, on } from '@ngrx/store';

import { setSentryConfig } from './sentry-config.actions';

export interface SentryConfigState {
  dsn: string;
}

export const initialState: SentryConfigState = {
  dsn: undefined,
};
export const sentryConfigReducer = createReducer(
  initialState,
  on(setSentryConfig, (state, action) => ({
    ...state,
    ...action.payload,
  }))
);
