import { createReducer, on } from '@ngrx/store';

import { Locale } from 'ish-core/models/locale/locale.model';
import { ServerConfig } from 'ish-core/models/server-config/server-config.model';
import { DeviceType } from 'ish-core/models/viewtype/viewtype.types';

import { environment } from '../../../../../environments/environment';

import { applyConfiguration, setGTMToken } from './configuration.actions';

export interface ConfigurationState {
  baseURL?: string;
  server?: string;
  serverStatic?: string;
  channel?: string;
  application?: string;
  features?: string[];
  gtmToken?: string;
  theme?: string;
  locales?: Locale[];
  lang?: string;
  // not synced via state transfer
  _serverConfig?: ServerConfig;
  _deviceType?: DeviceType;
}

const initialState: ConfigurationState = {
  baseURL: undefined,
  server: undefined,
  serverStatic: undefined,
  channel: undefined,
  application: undefined,
  features: undefined,
  gtmToken: undefined,
  theme: undefined,
  locales: environment.locales,
  lang: undefined,
  _serverConfig: undefined,
  _deviceType: environment.defaultDeviceType,
};
export const configurationReducer = createReducer(
  initialState,
  on(applyConfiguration, (state, action) => ({ ...state, ...action.payload })),
  on(setGTMToken, (state, action) => {
    const { gtmToken } = action.payload;
    return { ...state, gtmToken };
  })
);
