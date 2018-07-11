import { HttpErrorResponse } from '@angular/common/http';
import { BasketItem } from '../../../models/basket-item/basket-item.model';
import { Basket } from '../../../models/basket/basket.model';
import { Link } from '../../../models/link/link.model';
import { PaymentMethod } from '../../../models/payment-method/payment-method.model';
import * as fromActions from './basket.actions';
import { basketReducer, initialState } from './basket.reducer';

describe('Basket Reducer', () => {
  describe('LoadBasket actions', () => {
    describe('LoadBasket action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.LoadBasket('test');
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('LoadBasketFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.LoadBasketFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('LoadBasketSuccess action', () => {
      it('should set basket and set loading to false', () => {
        const basket = {
          id: 'test',
        } as Basket;

        const action = new fromActions.LoadBasketSuccess(basket);
        const state = basketReducer(initialState, action);

        expect(state.basket).toEqual(basket);
        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('UpdateBasket actions', () => {
    describe('UpdateBasket action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.UpdateBasket({ invoiceToAddress: { id: '1234' } });
        const state = basketReducer(initialState, action);

        expect(state.loading).toEqual(true);
      });
    });

    describe('UpdateBasketFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.UpdateBasketFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toEqual(false);
        expect(state.error).toEqual(error);
      });
    });

    describe('UpdateBasketSuccess action', () => {
      it('should set loading to false', () => {
        const action = new fromActions.UpdateBasketSuccess();
        const state = basketReducer(initialState, action);

        expect(state.loading).toEqual(false);
        expect(state.error).toBeNull();
      });
    });
  });

  describe('LoadBasketItems actions', () => {
    describe('LoadBasketItems action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.LoadBasketItems('test');
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('LoadBasketItemsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.LoadBasketItemsFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('LoadBasketItemsSuccess action', () => {
      it('should set basketItems and set loading to false', () => {
        const basket = {
          id: 'test',
        } as Basket;
        const basketItems = [] as BasketItem[];

        const basketAction = new fromActions.LoadBasketSuccess(basket);
        const basketItemsAction = new fromActions.LoadBasketItemsSuccess(basketItems);
        let state = basketReducer(initialState, basketAction);
        state = basketReducer(state, basketItemsAction);

        expect(state.lineItems).toEqual(basketItems);
        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('AddItemsToBasket actions', () => {
    describe('AddProductToBasket action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.AddProductToBasket({ sku: 'test', quantity: 1 });
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('AddItemsToBasketFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.AddItemsToBasketFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('AddItemsToBasketSuccess action', () => {
      it('should set loading to false', () => {
        const action = new fromActions.AddItemsToBasketSuccess();
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('AddQuoteToBasket actions', () => {
    describe('AddQuoteToBasket action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.AddQuoteToBasket('QID');
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('AddQuoteToBasketFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.AddQuoteToBasketFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('AddQuoteToBasketSuccess action', () => {
      it('should set loading to false', () => {
        const payload = {} as Link;
        const action = new fromActions.AddQuoteToBasketSuccess(payload);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('UpdateBasketItems actions', () => {
    describe('UpdateBasketItems action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.UpdateBasketItems([
          {
            quantity: 2,
            itemId: 'test',
          },
        ]);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('UpdateBasketItemsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.UpdateBasketItemsFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('UpdateBasketItemsSuccess action', () => {
      it('should set loading to false', () => {
        const action = new fromActions.UpdateBasketItemsSuccess();
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('DeleteBasketItem actions', () => {
    describe('DeleteBasketItem action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.DeleteBasketItem('test');
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('DeleteBasketItemFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.DeleteBasketItemFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('DeleteBasketItemSuccess action', () => {
      it('should set loading to false', () => {
        const action = new fromActions.DeleteBasketItemSuccess();
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });

    describe('ResetBasket action', () => {
      it('should reset to initial state', () => {
        const oldState = {
          ...initialState,
          loading: true,
          lineItems: [{ id: 'test' } as BasketItem],
        };
        const action = new fromActions.ResetBasket();
        const state = basketReducer(oldState, action);

        expect(state).toEqual(initialState);
      });
    });
  });

  describe('LoadBasketPayments actions', () => {
    describe('LoadBasketPayments action', () => {
      it('should set loading to true', () => {
        const action = new fromActions.LoadBasketPayments('test');
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('LoadBasketPaymentsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpErrorResponse;
        const action = new fromActions.LoadBasketPaymentsFail(error);
        const state = basketReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('LoadBasketPaymentsSuccess action', () => {
      it('should set basketPayments and set loading to false', () => {
        const basket = {
          id: 'test',
        } as Basket;
        const payments = [] as PaymentMethod[];

        const basketAction = new fromActions.LoadBasketSuccess(basket);
        const basketPaymentsAction = new fromActions.LoadBasketPaymentsSuccess(payments);
        let state = basketReducer(initialState, basketAction);
        state = basketReducer(state, basketPaymentsAction);

        expect(state.payments).toEqual(payments);
        expect(state.loading).toBeFalse();
      });
    });
  });
});
