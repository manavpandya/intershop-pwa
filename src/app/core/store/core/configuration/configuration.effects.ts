import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ApplicationRef, Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { Actions, ROOT_EFFECTS_INIT, createEffect, ofType } from '@ngrx/effects';
import { routerNavigationAction } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { defer, fromEvent, iif, merge } from 'rxjs';
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  mapTo,
  switchMapTo,
  take,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { LARGE_BREAKPOINT_WIDTH, MEDIUM_BREAKPOINT_WIDTH } from 'ish-core/configurations/injection-keys';
import { NGRX_STATE_SK } from 'ish-core/configurations/ngrx-state-transfer';
import { DeviceType } from 'ish-core/models/viewtype/viewtype.types';
import { ConfigurationService } from 'ish-core/services/configuration/configuration.service';
import { distinctCompareWith, mapErrorToAction, mapToProperty, whenFalsy, whenTruthy } from 'ish-core/utils/operators';
import { StatePropertiesService } from 'ish-core/utils/state-transfer/state-properties.service';

import { applyConfiguration, loadServerConfig, loadServerConfigFail, setGTMToken } from './configuration.actions';
import { getCurrentLocale, getDeviceType, isServerConfigurationLoaded } from './configuration.selectors';

@Injectable()
export class ConfigurationEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private configService: ConfigurationService,
    private translateService: TranslateService,
    private stateProperties: StatePropertiesService,
    @Optional() private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: string,
    private appRef: ApplicationRef,
    @Inject(MEDIUM_BREAKPOINT_WIDTH) private mediumBreakpointWidth: number,
    @Inject(LARGE_BREAKPOINT_WIDTH) private largeBreakpointWidth: number
  ) {}

  $stable = createEffect(
    () =>
      this.appRef.isStable.pipe(
        takeWhile(() => isPlatformBrowser(this.platformId)),
        // tslint:disable-next-line:no-any
        tap(stable => ((window as any).angularStable = stable))
      ),
    { dispatch: false }
  );

  /**
   * get server configuration on routing event, if it is not already loaded
   */
  loadServerConfigOnInit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigationAction),
      switchMapTo(this.store.pipe(select(isServerConfigurationLoaded))),
      whenFalsy(),
      mapTo(loadServerConfig())
    )
  );

  loadServerConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadServerConfig),
      concatMap(() =>
        this.configService.getServerConfiguration().pipe(
          map(serverConfig => applyConfiguration({ payload: { _serverConfig: serverConfig } })),
          mapErrorToAction(loadServerConfigFail)
        )
      )
    )
  );

  setInitialRestEndpoint$ = createEffect(() =>
    iif(
      () => !this.transferState || !this.transferState.hasKey(NGRX_STATE_SK),
      this.actions$.pipe(
        ofType(ROOT_EFFECTS_INIT),
        take(1),
        withLatestFrom(
          this.stateProperties.getStateOrEnvOrDefault<string>('ICM_BASE_URL', 'icmBaseURL'),
          this.stateProperties.getStateOrEnvOrDefault<string>('ICM_SERVER', 'icmServer'),
          this.stateProperties.getStateOrEnvOrDefault<string>('ICM_SERVER_STATIC', 'icmServerStatic'),
          this.stateProperties.getStateOrEnvOrDefault<string>('ICM_CHANNEL', 'icmChannel'),
          this.stateProperties.getStateOrEnvOrDefault<string>('ICM_APPLICATION', 'icmApplication'),
          this.stateProperties
            .getStateOrEnvOrDefault<string | string[]>('FEATURES', 'features')
            .pipe(map(x => (typeof x === 'string' ? x.split(/,/g) : x))),
          this.stateProperties.getStateOrEnvOrDefault<string>('THEME', 'theme').pipe(map(x => x || 'default'))
        ),
        map(([, baseURL, server, serverStatic, channel, application, features, theme]) =>
          applyConfiguration({ payload: { baseURL, server, serverStatic, channel, application, features, theme } })
        )
      )
    )
  );

  setLocale$ = createEffect(
    () =>
      this.store.pipe(
        select(getCurrentLocale),
        mapToProperty('lang'),
        distinctUntilChanged(),
        // https://github.com/ngx-translate/core/issues/1030
        debounceTime(0),
        whenTruthy(),
        tap(lang => this.translateService.use(lang))
      ),
    { dispatch: false }
  );

  setGTMToken$ = createEffect(() =>
    this.actions$.pipe(
      takeWhile(() => isPlatformServer(this.platformId)),
      ofType(ROOT_EFFECTS_INIT),
      take(1),
      withLatestFrom(this.stateProperties.getStateOrEnvOrDefault<string>('GTM_TOKEN', 'gtmToken')),
      map(([, gtmToken]) => gtmToken),
      whenTruthy(),
      map(gtmToken => setGTMToken({ payload: { gtmToken } }))
    )
  );

  setDeviceType$ = createEffect(() =>
    iif(
      () => isPlatformBrowser(this.platformId),
      defer(() =>
        merge(this.actions$.pipe(ofType(ROOT_EFFECTS_INIT)), fromEvent(window, 'resize')).pipe(
          map<unknown, DeviceType>(() => {
            if (window.innerWidth < this.mediumBreakpointWidth) {
              return 'mobile';
            } else if (window.innerWidth < this.largeBreakpointWidth) {
              return 'tablet';
            } else {
              return 'desktop';
            }
          }),
          distinctCompareWith(this.store.pipe(select(getDeviceType))),
          map(deviceType => applyConfiguration({ payload: { _deviceType: deviceType } }))
        )
      )
    )
  );
}
