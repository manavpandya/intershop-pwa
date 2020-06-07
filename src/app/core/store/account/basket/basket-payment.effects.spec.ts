import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { cold, hot } from 'jest-marbles';
import { Observable, of, throwError } from 'rxjs';
import { anyString, anything, instance, mock, verify, when } from 'ts-mockito';

import { Basket } from 'ish-core/models/basket/basket.model';
import { Customer } from 'ish-core/models/customer/customer.model';
import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { PaymentInstrument } from 'ish-core/models/payment-instrument/payment-instrument.model';
import { PaymentMethod } from 'ish-core/models/payment-method/payment-method.model';
import { Payment } from 'ish-core/models/payment/payment.model';
import { PaymentService } from 'ish-core/services/payment/payment.service';
import { AccountStoreModule } from 'ish-core/store/account/account-store.module';
import { loginUserSuccess } from 'ish-core/store/account/user';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { ShoppingStoreModule } from 'ish-core/store/shopping/shopping-store.module';
import { BasketMockData } from 'ish-core/utils/dev/basket-mock-data';

import { BasketPaymentEffects } from './basket-payment.effects';
import {
  createBasketPayment,
  createBasketPaymentFail,
  createBasketPaymentSuccess,
  deleteBasketPayment,
  deleteBasketPaymentFail,
  deleteBasketPaymentSuccess,
  loadBasket,
  loadBasketEligiblePaymentMethods,
  loadBasketEligiblePaymentMethodsFail,
  loadBasketEligiblePaymentMethodsSuccess,
  loadBasketSuccess,
  setBasketPayment,
  setBasketPaymentFail,
  setBasketPaymentSuccess,
  updateBasketPayment,
  updateBasketPaymentFail,
  updateBasketPaymentSuccess,
} from './basket.actions';

describe('Basket Payment Effects', () => {
  let actions$: Observable<Action>;
  let paymentServiceMock: PaymentService;
  let effects: BasketPaymentEffects;
  let store$: Store;
  let router: Router;

  beforeEach(() => {
    paymentServiceMock = mock(PaymentService);

    @Component({ template: 'dummy' })
    class DummyComponent {}

    TestBed.configureTestingModule({
      declarations: [DummyComponent],
      imports: [
        AccountStoreModule.forTesting('user', 'basket'),
        CoreStoreModule.forTesting(['router']),
        RouterTestingModule.withRoutes([{ path: 'checkout/review', component: DummyComponent }]),
        ShoppingStoreModule.forTesting('products', 'categories'),
      ],
      providers: [
        BasketPaymentEffects,
        provideMockActions(() => actions$),
        { provide: PaymentService, useFactory: () => instance(paymentServiceMock) },
      ],
    });

    effects = TestBed.inject(BasketPaymentEffects);
    store$ = TestBed.inject(Store);
    router = TestBed.inject(Router);
  });

  describe('loadBasketEligiblePaymentMethods$', () => {
    beforeEach(() => {
      when(paymentServiceMock.getBasketEligiblePaymentMethods(anyString())).thenReturn(
        of([BasketMockData.getPaymentMethod()])
      );

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [],
            } as Basket,
          },
        })
      );
    });

    it('should call the paymentService for loadBasketEligiblePaymentMethods', done => {
      const action = loadBasketEligiblePaymentMethods();
      actions$ = of(action);

      effects.loadBasketEligiblePaymentMethods$.subscribe(() => {
        verify(paymentServiceMock.getBasketEligiblePaymentMethods('BID')).once();
        done();
      });
    });

    it('should map to action of type loadBasketEligiblePaymentMethodsSuccess', () => {
      const action = loadBasketEligiblePaymentMethods();
      const completion = loadBasketEligiblePaymentMethodsSuccess({
        payload: {
          paymentMethods: [BasketMockData.getPaymentMethod()],
        },
      });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketEligiblePaymentMethods$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type LoadBasketEligiblePaymentMethodsFail', () => {
      when(paymentServiceMock.getBasketEligiblePaymentMethods(anyString())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = loadBasketEligiblePaymentMethods();
      const completion = loadBasketEligiblePaymentMethodsFail({
        payload: {
          error: {
            message: 'invalid',
          } as HttpError,
        },
      });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketEligiblePaymentMethods$).toBeObservable(expected$);
    });
  });

  describe('setPaymentAtBasket$ - set payment at basket for the first time', () => {
    beforeEach(() => {
      when(paymentServiceMock.setBasketPayment(anyString(), anyString())).thenReturn(of(undefined));

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [],
              payment: undefined,
            } as Basket,
          },
        })
      );
    });

    it('should call the paymentService for setPaymentAtBasket', done => {
      const id = 'newPayment';
      const action = setBasketPayment({ payload: { id } });
      actions$ = of(action);

      effects.setPaymentAtBasket$.subscribe(() => {
        verify(paymentServiceMock.setBasketPayment('BID', id)).once();
        done();
      });
    });

    it('should map to action of type SetBasketPaymentSuccess', () => {
      const id = 'newPayment';
      const action = setBasketPayment({ payload: { id } });
      const completion = setBasketPaymentSuccess();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.setPaymentAtBasket$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type SetPaymentFail', () => {
      when(paymentServiceMock.setBasketPayment(anyString(), anyString())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = setBasketPayment({ payload: { id: 'newPayment' } });
      const completion = setBasketPaymentFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.setPaymentAtBasket$).toBeObservable(expected$);
    });
  });

  describe('setPaymentAtBasket$ - change payment method at basket', () => {
    beforeEach(() => {
      when(paymentServiceMock.setBasketPayment(anyString(), anyString())).thenReturn(of(undefined));

      store$.dispatch(loadBasketSuccess({ payload: { basket: BasketMockData.getBasket() } }));
    });

    it('should call the paymentService for setPaymentAtBasket', done => {
      const id = 'newPayment';
      const action = setBasketPayment({ payload: { id } });
      actions$ = of(action);

      effects.setPaymentAtBasket$.subscribe(() => {
        verify(paymentServiceMock.setBasketPayment('4711', id)).once();
        done();
      });
    });

    it('should map to action of type SetBasketPaymentSuccess', () => {
      const id = 'newPayment';
      const action = setBasketPayment({ payload: { id } });
      const completion = setBasketPaymentSuccess();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.setPaymentAtBasket$).toBeObservable(expected$);
    });

    it('should map invalid addBasketPayment request to action of type SetPaymentFail', () => {
      when(paymentServiceMock.setBasketPayment(anyString(), anyString())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = setBasketPayment({ payload: { id: 'newPayment' } });
      const completion = setBasketPaymentFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.setPaymentAtBasket$).toBeObservable(expected$);
    });
  });

  describe('createBasketPaymentInstrument$', () => {
    const paymentInstrument = {
      id: undefined,
      paymentMethod: 'ISH_DirectDebit',
      parameters_: [
        {
          name: 'accountHolder',
          value: 'Patricia Miller',
        },
        {
          name: 'IBAN',
          value: 'DE430859340859340',
        },
      ],
    };
    const customer = { customerNo: 'patricia' } as Customer;

    beforeEach(() => {
      when(paymentServiceMock.createBasketPayment(anyString(), anything())).thenReturn(
        of({ id: 'newPaymentInstrumentId' } as PaymentInstrument)
      );
      when(paymentServiceMock.createUserPayment(anyString(), anything())).thenReturn(
        of({ id: 'newPaymentInstrumentId' } as PaymentInstrument)
      );

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [],
              payment: undefined,
            } as Basket,
          },
        })
      );
      store$.dispatch(loginUserSuccess({ payload: { customer } }));
    });

    it('should call the paymentService if payment instrument is saved at basket', done => {
      const action = createBasketPayment({ payload: { paymentInstrument, saveForLater: false } });
      actions$ = of(action);

      effects.createBasketPaymentInstrument$.subscribe(() => {
        verify(paymentServiceMock.createBasketPayment('BID', anything())).once();
        done();
      });
    });

    it('should call the paymentService if payment instrument is saved at user', done => {
      const action = createBasketPayment({ payload: { paymentInstrument, saveForLater: true } });
      actions$ = of(action);

      effects.createBasketPaymentInstrument$.subscribe(() => {
        verify(paymentServiceMock.createUserPayment(customer.customerNo, anything())).once();
        done();
      });
    });
    it('should map to action of type SetBasketPayment and CreateBasketPaymentSuccess', () => {
      const action = createBasketPayment({ payload: { paymentInstrument, saveForLater: false } });
      const completion1 = setBasketPayment({ payload: { id: 'newPaymentInstrumentId' } });
      const completion2 = createBasketPaymentSuccess();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-(cd)', { c: completion1, d: completion2 });

      expect(effects.createBasketPaymentInstrument$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type CreateBasketPaymentFail', () => {
      when(paymentServiceMock.createBasketPayment(anyString(), anything())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = createBasketPayment({ payload: { paymentInstrument, saveForLater: false } });
      const completion = createBasketPaymentFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.createBasketPaymentInstrument$).toBeObservable(expected$);
    });

    it('should map to action of type LoadEligibleBasketMethod in case of success', () => {
      const action = createBasketPaymentSuccess();
      const completion = loadBasketEligiblePaymentMethods();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketEligiblePaymentMethodsAfterChange$).toBeObservable(expected$);
    });
  });

  describe('sendPaymentRedirectData$', () => {
    beforeEach(() => {
      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [],
            } as Basket,
          },
        })
      );
    });

    it('should trigger updateBasketPayment action if checkout payment/review page is called with query param "redirect"', done => {
      router.navigate(['checkout', 'review'], { queryParams: { redirect: 'success', param1: 123 } });

      effects.sendPaymentRedirectData$.subscribe(action => {
        expect(action).toMatchInlineSnapshot(`
          [Basket] Update a Basket Payment with Redirect Data:
            params: {"redirect":"success","param1":"123"}
        `);
        done();
      });
    });
  });

  describe('updateBasketPayment$', () => {
    const paymentInstrument = {
      id: '456',
      paymentMethod: 'ISH_DirectDebit',
      parameters_: [
        {
          name: 'accountHolder',
          value: 'Patricia Miller',
        },
        {
          name: 'IBAN',
          value: 'DE430859340859340',
        },
      ],
    };

    const params = {
      redirect: 'success',
      param1: '123',
      param2: '456',
    };

    const payment = {
      id: '123',
      paymentInstrument,
      paymentMethod: { id: 'ISH_DirectDebit' } as PaymentMethod,
      redirectRequired: false,
    };

    beforeEach(() => {
      when(paymentServiceMock.updateBasketPayment(anyString(), anything())).thenReturn(of(payment));

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [],
              payment: payment as Payment,
            } as Basket,
          },
        })
      );
    });

    it('should call the paymentService for updateBasketPayment', done => {
      const action = updateBasketPayment({ payload: { params } });
      actions$ = of(action);

      effects.updateBasketPayment$.subscribe(() => {
        verify(paymentServiceMock.updateBasketPayment('BID', anything())).once();
        done();
      });
    });

    it('should map to action of type UpdateBasketPaymentSuccess', () => {
      const action = updateBasketPayment({ payload: { params } });
      const completion = updateBasketPaymentSuccess();

      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.updateBasketPayment$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type UpdateBasketPaymentFail', () => {
      when(paymentServiceMock.updateBasketPayment(anyString(), anything())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = updateBasketPayment({ payload: { params } });
      const completion = updateBasketPaymentFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.updateBasketPayment$).toBeObservable(expected$);
    });

    it('should map to action of type LoadBasket in case of success', () => {
      const action = updateBasketPaymentSuccess();
      const completion = loadBasket();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketAfterBasketChangeSuccess$).toBeObservable(expected$);
    });
  });

  describe('deleteBasketPaymentInstrument$', () => {
    const paymentInstrument = {
      id: '12345',
      paymentMethod: 'ISH_DirectDebit',
      parameters_: [
        {
          name: 'accountHolder',
          value: 'Patricia Miller',
        },
        {
          name: 'IBAN',
          value: 'DE430859340859340',
        },
      ],
    };

    const basket = {
      id: 'BID',
      lineItems: [],
      payment: undefined,
    } as Basket;
    beforeEach(() => {
      when(paymentServiceMock.deleteBasketPaymentInstrument(anything(), anything())).thenReturn(of(undefined));

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket,
          },
        })
      );
    });

    it('should call the paymentService for deleteBasketPayment', done => {
      const action = deleteBasketPayment({ payload: { paymentInstrument } });
      actions$ = of(action);

      effects.deleteBasketPaymentInstrument$.subscribe(() => {
        verify(paymentServiceMock.deleteBasketPaymentInstrument(anything(), anything())).once();
        done();
      });
    });

    it('should map to action of type DeleteBasketPaymentSuccess', () => {
      const action = deleteBasketPayment({ payload: { paymentInstrument } });
      const completion = deleteBasketPaymentSuccess();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.deleteBasketPaymentInstrument$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type DeleteBasketPaymentFail', () => {
      when(paymentServiceMock.deleteBasketPaymentInstrument(anything(), anything())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = deleteBasketPayment({ payload: { paymentInstrument } });
      const completion = deleteBasketPaymentFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.deleteBasketPaymentInstrument$).toBeObservable(expected$);
    });

    it('should map to action of type GetEligiblePaymentMethods in case of success', () => {
      const action = deleteBasketPaymentSuccess();
      const completion = loadBasketEligiblePaymentMethods();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketEligiblePaymentMethodsAfterChange$).toBeObservable(expected$);
    });

    it('should map to action of type LoadBasket in case of success', () => {
      const action = deleteBasketPaymentSuccess();
      const completion = loadBasket();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketAfterBasketChangeSuccess$).toBeObservable(expected$);
    });
  });
});
