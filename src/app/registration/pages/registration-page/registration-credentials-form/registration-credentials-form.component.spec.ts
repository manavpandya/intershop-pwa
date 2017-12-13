import { NO_ERRORS_SCHEMA } from '@angular/core/';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { USER_REGISTRATION_SUBSCRIBE_TO_NEWSLETTER } from '../../../../core/configurations/injection-keys';
import { SharedModule } from '../../../../shared/shared.module';
import { RegistrationCredentialsFormComponent } from './registration-credentials-form.component';

describe('Credentials Form Component', () => {
  let component: RegistrationCredentialsFormComponent;
  let fixture: ComponentFixture<RegistrationCredentialsFormComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrationCredentialsFormComponent],
      imports: [
        SharedModule
      ],
      providers: [
        { provide: USER_REGISTRATION_SUBSCRIBE_TO_NEWSLETTER, useValue: true },
        { provide: TranslateService }

      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(RegistrationCredentialsFormComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
  });
});