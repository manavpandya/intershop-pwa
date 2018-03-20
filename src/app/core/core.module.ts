import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RecaptchaModule } from 'ng-recaptcha/recaptcha/recaptcha.module';
import { CustomFormsModule } from 'ng2-validation';
import { CarouselModule } from 'ngx-bootstrap/carousel/carousel.module';
import { CollapseModule } from 'ngx-bootstrap/collapse/collapse.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown/bs-dropdown.module';
import { ModalModule } from 'ngx-bootstrap/modal/modal.module';
import { PopoverConfig } from 'ngx-bootstrap/popover/popover.config';
import { PopoverModule } from 'ngx-bootstrap/popover/popover.module';
import { StyleWrapperDirective } from './directives/style-wrapper.directive';
import { FooterModule } from './footer.module';
import { HeaderModule } from './header.module';
import { ApiService } from './services/api.service';
import { ApiServiceErrorHandler } from './services/api.service.errorhandler';
import { CountryService } from './services/countries/country.service';
import { RegionService } from './services/countries/region.service';
import { translateFactory } from './services/custom-translate-loader';
import { ErrorCodeMappingService } from './services/error-code-mapping.service';
import { StatePropertiesService } from './services/state-transfer/state-properties.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateFactory,
        deps: [HttpClient]
      }
    }),
    CustomFormsModule,
    RecaptchaModule.forRoot(),
    BsDropdownModule.forRoot(),
    CarouselModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    HeaderModule,
    FooterModule
  ],
  declarations: [
    StyleWrapperDirective
  ],
  providers: [
    ApiService,
    ApiServiceErrorHandler,
    ErrorCodeMappingService,
    StatePropertiesService,
    CountryService,
    RegionService,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  exports: [
    StyleWrapperDirective,
    HeaderModule,
    FooterModule
  ]
})
export class CoreModule {

  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule,
    popoverConfig: PopoverConfig
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
    popoverConfig.placement = 'top';
    popoverConfig.triggers = 'hover';
    popoverConfig.container = 'body';
  }
}
