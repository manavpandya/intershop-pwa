import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store } from '@ngrx/store';
import { cold, hot } from 'jest-marbles';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { anyString, anything, instance, mock, verify, when } from 'ts-mockito';

import { BasketBaseData } from 'ish-core/models/basket/basket.interface';
import { Basket } from 'ish-core/models/basket/basket.model';
import { Credentials } from 'ish-core/models/credentials/credentials.model';
import { Customer } from 'ish-core/models/customer/customer.model';
import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { LineItem } from 'ish-core/models/line-item/line-item.model';
import { Product, ProductCompletenessLevel } from 'ish-core/models/product/product.model';
import { BasketService } from 'ish-core/services/basket/basket.service';
import { AccountStoreModule } from 'ish-core/store/account/account-store.module';
import { loginUser, loginUserSuccess, setAPIToken } from 'ish-core/store/account/user';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { loadProductIfNotLoaded, loadProductSuccess } from 'ish-core/store/shopping/products';
import { ShoppingStoreModule } from 'ish-core/store/shopping/shopping-store.module';
import { BasketMockData } from 'ish-core/utils/dev/basket-mock-data';

import {
  loadBasket,
  loadBasketByAPIToken,
  loadBasketEligibleShippingMethods,
  loadBasketEligibleShippingMethodsFail,
  loadBasketEligibleShippingMethodsSuccess,
  loadBasketFail,
  loadBasketSuccess,
  mergeBasket,
  mergeBasketFail,
  mergeBasketSuccess,
  resetBasketErrors,
  updateBasket,
  updateBasketFail,
  updateBasketShippingMethod,
} from './basket.actions';
import { BasketEffects } from './basket.effects';

describe('Basket Effects', () => {
  let actions$: Observable<Action>;
  let basketServiceMock: BasketService;
  let effects: BasketEffects;
  let store$: Store;
  let router: Router;

  beforeEach(() => {
    basketServiceMock = mock(BasketService);

    @Component({ template: 'dummy' })
    class DummyComponent {}

    TestBed.configureTestingModule({
      declarations: [DummyComponent],
      imports: [
        AccountStoreModule.forTesting('user', 'basket'),
        CoreStoreModule.forTesting(['router']),
        RouterTestingModule.withRoutes([{ path: '**', component: DummyComponent }]),
        ShoppingStoreModule.forTesting('products', 'categories'),
      ],
      providers: [
        BasketEffects,
        provideMockActions(() => actions$),
        { provide: BasketService, useFactory: () => instance(basketServiceMock) },
      ],
    });

    effects = TestBed.inject(BasketEffects);
    store$ = TestBed.inject(Store);
    router = TestBed.inject(Router);
  });

  describe('loadBasket$', () => {
    beforeEach(() => {
      when(basketServiceMock.getBasket()).thenCall(() => of({ id: 'BID' } as Basket));
    });

    it('should call the basketService for loadBasket', done => {
      const action = loadBasket();
      actions$ = of(action);

      effects.loadBasket$.subscribe(() => {
        verify(basketServiceMock.getBasket()).once();
        done();
      });
    });

    it('should map to action of type LoadBasketSuccess', () => {
      const id = 'BID';
      const action = loadBasket();
      const completion = loadBasketSuccess({ payload: { basket: { id } as Basket } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasket$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type LoadBasketFail', () => {
      when(basketServiceMock.getBasket()).thenReturn(throwError({ message: 'invalid' }));
      const action = loadBasket();
      const completion = loadBasketFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasket$).toBeObservable(expected$);
    });
  });

  describe('loadBasketByAPIToken$', () => {
    it('should call the basket service on LoadUserByAPIToken action and load user on success', done => {
      when(basketServiceMock.getBasketByToken('dummy')).thenReturn(of({ id: 'basket' } as Basket));

      actions$ = of(loadBasketByAPIToken({ payload: { apiToken: 'dummy' } }));

      effects.loadBasketByAPIToken$.subscribe(action => {
        verify(basketServiceMock.getBasketByToken('dummy')).once();
        expect(action).toMatchInlineSnapshot(`
          [Basket API] Load Basket Success:
            basket: {"id":"basket"}
        `);
        done();
      });
    });

    it('should call the basket service on LoadUserByAPIToken action and do nothing when failing', () => {
      when(basketServiceMock.getBasketByToken('dummy')).thenReturn(EMPTY);

      actions$ = hot('a-a-a-', { a: loadBasketByAPIToken({ payload: { apiToken: 'dummy' } }) });

      expect(effects.loadBasketByAPIToken$).toBeObservable(cold('------'));
    });
  });

  describe('loadProductsForBasket$', () => {
    it('should trigger product loading actions for line items if LoadBasketSuccess action triggered', () => {
      when(basketServiceMock.getBasket()).thenReturn(of());

      const action = loadBasketSuccess({
        payload: {
          basket: {
            id: 'BID',
            lineItems: [
              {
                id: 'BIID',
                name: 'NAME',
                position: 1,
                quantity: { value: 1 },
                price: undefined,
                productSKU: 'SKU',
              } as LineItem,
            ],
            payment: undefined,
          } as Basket,
        },
      });

      const completion = loadProductIfNotLoaded({ payload: { sku: 'SKU', level: ProductCompletenessLevel.List } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadProductsForBasket$).toBeObservable(expected$);
    });
    it('should trigger product loading actions for line items if MergeBasketSuccess action triggered', () => {
      when(basketServiceMock.getBasket()).thenReturn(of());

      const action = mergeBasketSuccess({
        payload: {
          basket: {
            id: 'BID',
            lineItems: [
              {
                id: 'BIID',
                name: 'NAME',
                position: 1,
                quantity: { value: 1 },
                price: undefined,
                productSKU: 'SKU',
              } as LineItem,
            ],
            payment: undefined,
          } as Basket,
        },
      });

      const completion = loadProductIfNotLoaded({ payload: { sku: 'SKU', level: ProductCompletenessLevel.List } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadProductsForBasket$).toBeObservable(expected$);
    });
  });

  describe('loadBasketEligibleShippingMethods$', () => {
    beforeEach(() => {
      when(basketServiceMock.getBasketEligibleShippingMethods(anyString(), anything())).thenReturn(
        of([BasketMockData.getShippingMethod()])
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

    it('should call the basketService for loadBasketEligibleShippingMethods', done => {
      const action = loadBasketEligibleShippingMethods();
      actions$ = of(action);

      effects.loadBasketEligibleShippingMethods$.subscribe(() => {
        verify(basketServiceMock.getBasketEligibleShippingMethods('BID', undefined)).once();
        done();
      });
    });

    it('should map to action of type loadBasketEligibleShippingMethodsSuccess', () => {
      const action = loadBasketEligibleShippingMethods();
      const completion = loadBasketEligibleShippingMethodsSuccess({
        payload: {
          shippingMethods: [BasketMockData.getShippingMethod()],
        },
      });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketEligibleShippingMethods$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type LoadBasketEligibleShippingMethodsFail', () => {
      when(basketServiceMock.getBasketEligibleShippingMethods(anyString(), anything())).thenReturn(
        throwError({ message: 'invalid' })
      );
      const action = loadBasketEligibleShippingMethods();
      const completion = loadBasketEligibleShippingMethodsFail({
        payload: {
          error: {
            message: 'invalid',
          } as HttpError,
        },
      });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketEligibleShippingMethods$).toBeObservable(expected$);
    });
  });

  describe('updateBasket$', () => {
    beforeEach(() => {
      when(basketServiceMock.updateBasket(anyString(), anything())).thenReturn(of(BasketMockData.getBasket()));

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

    it('should call the basketService for updateBasket', done => {
      const basketId = 'BID';
      const update = { invoiceToAddress: '7654' };
      const action = updateBasket({ payload: { update } });
      actions$ = of(action);

      effects.updateBasket$.subscribe(() => {
        verify(basketServiceMock.updateBasket(basketId, update)).once();
        done();
      });
    });

    it('should map to action of type LoadBasketSuccess and ResetBasketErrors', () => {
      const update = { commonShippingMethod: 'shippingId' };
      const action = updateBasket({ payload: { update } });
      const completion1 = loadBasketSuccess({ payload: { basket: BasketMockData.getBasket() } });
      const completion2 = resetBasketErrors();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-(cd)', { c: completion1, d: completion2 });

      expect(effects.updateBasket$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type UpdateBasketFail', () => {
      const update = { commonShippingMethod: 'shippingId' };
      when(basketServiceMock.updateBasket(anyString(), anything())).thenReturn(throwError({ message: 'invalid' }));

      const action = updateBasket({ payload: { update } });
      const completion = updateBasketFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.updateBasket$).toBeObservable(expected$);
    });
  });

  describe('updateBasketShippingMethod$', () => {
    it('should trigger the updateBasket action if called', () => {
      const shippingId = 'shippingId';
      const action = updateBasketShippingMethod({ payload: { shippingId } });
      const completion = updateBasket({
        payload: {
          update: { commonShippingMethod: shippingId },
        },
      });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.updateBasketShippingMethod$).toBeObservable(expected$);
    });
  });

  describe('mergeBasketAfterLogin$', () => {
    it('should map to action of type addItemsToBasket if pre login basket is filled', () => {
      when(basketServiceMock.getBaskets()).thenReturn(of([{ id: 'BIDNEW' } as BasketBaseData]));

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [
                {
                  id: 'BIID',
                  name: 'NAME',
                  quantity: { value: 1, unit: 'pcs.' },
                  productSKU: 'SKU',
                  price: undefined,
                } as LineItem,
              ],
            } as Basket,
          },
        })
      );
      store$.dispatch(loadProductSuccess({ payload: { product: { sku: 'SKU' } as Product } }));

      const action = loginUserSuccess({ payload: { customer: {} as Customer } });
      const completion = mergeBasket();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.mergeBasketAfterLogin$).toBeObservable(expected$);
    });
  });

  describe('mergeBasket$', () => {
    const basketID = 'BID';
    const sourceAuthToken = 'authToken';

    beforeEach(() => {
      when(basketServiceMock.mergeBasket(anyString(), anyString())).thenReturn(of(BasketMockData.getBasket()));

      store$.dispatch(
        loadBasketSuccess({
          payload: {
            basket: {
              id: 'BID',
              lineItems: [
                {
                  id: 'BIID',
                  name: 'NAME',
                  quantity: { value: 1 },
                  productSKU: 'SKU',
                  price: undefined,
                } as LineItem,
              ],
            } as Basket,
          },
        })
      );
      store$.dispatch(loadProductSuccess({ payload: { product: { sku: 'SKU' } as Product } }));
      store$.dispatch(setAPIToken({ payload: { apiToken: sourceAuthToken } }));
      store$.dispatch(loginUser({ payload: { credentials: {} as Credentials } }));
    });

    it('should call the basketService for mergeBasket', done => {
      const action = mergeBasket();
      actions$ = of(action);

      effects.mergeBasket$.subscribe(() => {
        verify(basketServiceMock.mergeBasket(basketID, sourceAuthToken)).once();
        done();
      });
    });

    it('should map to action of type MergeBasketSuccess', () => {
      const action = mergeBasket();
      const completion = mergeBasketSuccess({ payload: { basket: BasketMockData.getBasket() } });
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.mergeBasket$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type MergeBasketFail', () => {
      when(basketServiceMock.mergeBasket(anyString(), anyString())).thenReturn(throwError({ message: 'invalid' }));

      const action = mergeBasket();
      const completion = mergeBasketFail({ payload: { error: { message: 'invalid' } as HttpError } });
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.mergeBasket$).toBeObservable(expected$);
    });
  });

  describe('loadBasketAfterLogin$', () => {
    it('should map to action of type LoadBasket if pre login basket is empty', () => {
      when(basketServiceMock.getBaskets()).thenReturn(of([{ id: 'BIDNEW' } as BasketBaseData]));

      const action = loginUserSuccess({ payload: { customer: {} as Customer } });
      const completion = loadBasket();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.loadBasketAfterLogin$).toBeObservable(expected$);
    });
  });

  describe('loadBasketAfterLogin$', () => {
    it('should map to action of type LoadBasket if pre login basket is empty', () => {
      when(basketServiceMock.getBaskets()).thenReturn(of([{ id: 'BIDNEW' } as BasketBaseData]));

      const action = loginUserSuccess({ payload: { customer: {} as Customer } });
      const completion = loadBasket();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.loadBasketAfterLogin$).toBeObservable(expected$);
    });
  });

  describe('routeListenerForResettingBasketErrors$', () => {
    it('should fire ResetBasketErrors when route basket or checkout/* is navigated', done => {
      router.navigateByUrl('/checkout/payment');

      effects.routeListenerForResettingBasketErrors$.subscribe(action => {
        expect(action).toMatchInlineSnapshot(`[Basket Internal] Reset Basket and Basket Promotion Errors`);
        done();
      });
    });

    it('should not fire ResetBasketErrors when route basket or checkout/* is navigated with query param error=true', done => {
      router.navigateByUrl('/checkout/payment?error=true');

      effects.routeListenerForResettingBasketErrors$.subscribe(fail, fail, fail);

      setTimeout(done, 1000);
    });

    it('should not fire ResetBasketErrors when route /something is navigated', done => {
      router.navigateByUrl('/something');

      effects.routeListenerForResettingBasketErrors$.subscribe(fail, fail, fail);

      setTimeout(done, 1000);
    });
  });
});
