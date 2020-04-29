import { HttpHeaders } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { anyString, anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { Address } from 'ish-core/models/address/address.model';
import { ApiService } from 'ish-core/services/api/api.service';
import { BasketMockData } from 'ish-core/utils/dev/basket-mock-data';

import { BasketItemUpdateType, BasketService } from './basket.service';

describe('Basket Service', () => {
  let basketService: BasketService;
  let apiService: ApiService;

  const basketMockData = {
    data: {
      id: 'test',
      calculationState: 'UNCALCULATED',
      buckets: [
        {
          lineItems: [],
          shippingMethod: {},
          shipToAddress: {},
        },
      ],
      payment: {
        name: 'testPayment',
        id: 'paymentId',
      },
      totals: {},
    },
  };

  const lineItemData = {
    id: 'test',
    quantity: {
      type: 'Quantity',
      unit: '',
      value: 1,
    },
  };

  const itemMockData = {
    sku: 'test',
    quantity: 10,
    unit: 'pcs.',
  };

  const sourceBasket = '012345';

  const basketMergeResponseData = {
    data: {
      sourceBasket,
      targetBasket: '345678abc',
    },
    included: {
      targetBasket: {
        '345678abc': {
          id: 'test',
          calculationState: 'UNCALCULATED',
          buckets: [
            {
              lineItems: [],
              shippingMethod: {},
              shipToAddress: {},
            },
          ],
          payment: {
            name: 'testPayment',
            id: 'paymentId',
          },
          totals: {},
        },
      },
    },
  };

  beforeEach(() => {
    apiService = mock(ApiService);
    basketService = new BasketService(instance(apiService));
  });

  it("should get basket data when 'getBasket' is called", done => {
    when(apiService.get(`baskets/current`, anything())).thenReturn(of(basketMockData));

    basketService.getBasket().subscribe(data => {
      expect(data.id).toEqual(basketMockData.data.id);
      verify(apiService.get(`baskets/current`, anything())).once();
      done();
    });
  });

  it('should load a basket by token when requested and successful', done => {
    when(apiService.get(anything(), anything())).thenReturn(of(basketMockData));

    basketService.getBasketByToken('dummy').subscribe(data => {
      verify(apiService.get(anything(), anything())).once();
      const [path, options] = capture<string, { headers: HttpHeaders }>(apiService.get).last();
      expect(path).toEqual('baskets/current');
      expect(options.headers.get(ApiService.TOKEN_HEADER_KEY)).toEqual('dummy');
      expect(data).toHaveProperty('id', 'test');
      done();
    });
  });

  it('should not throw errors when getting a basket by token is unsuccessful', done => {
    when(apiService.get(anything(), anything())).thenReturn(throwError(new Error()));

    basketService.getBasketByToken('dummy').subscribe(fail, fail, done);
  });

  it("should create a basket data when 'createBasket' is called", done => {
    when(apiService.post(anything(), anything(), anything())).thenReturn(of(basketMockData));

    basketService.createBasket().subscribe(data => {
      expect(data.id).toEqual(basketMockData.data.id);
      verify(apiService.post(`baskets`, anything(), anything())).once();
      done();
    });
  });

  it("should update data to basket of a specific basket when 'updateBasket' is called", done => {
    when(apiService.patch(anything(), anything(), anything())).thenReturn(of(basketMockData));
    const payload = { invoiceToAddress: '123456' };

    basketService.updateBasket(payload).subscribe(() => {
      verify(apiService.patch(`baskets/current`, payload, anything())).once();
      done();
    });
  });

  it("should validate the basket when 'validateBasket' is called", done => {
    when(apiService.post(anything(), anything(), anything())).thenReturn(of(undefined));

    basketService.validateBasket(basketMockData.data.id).subscribe(() => {
      verify(apiService.post(`baskets/current/validations`, anything(), anything())).once();
      done();
    });
  });

  it("should get active baskets of the current user when 'getBaskets' is called", done => {
    when(apiService.get(anything(), anything())).thenReturn(of({}));

    basketService.getBaskets().subscribe(() => {
      verify(apiService.get(`baskets`, anything())).once();
      done();
    });
  });

  it("should post item to basket when 'addItemsToBasket' is called", done => {
    when(apiService.post(anything(), anything(), anything())).thenReturn(of({}));

    basketService.addItemsToBasket([itemMockData]).subscribe(() => {
      verify(apiService.post(`baskets/current/items`, anything(), anything())).once();
      done();
    });
  });

  it("should post source basket to basket when 'mergeBasket' is called", done => {
    when(apiService.get(anything(), anything())).thenReturn(of({}));
    when(apiService.post(`baskets`, anything(), anything())).thenReturn(of(basketMockData));
    when(apiService.post(`baskets/${basketMockData.data.id}/merges`, anything(), anything())).thenReturn(
      of(basketMergeResponseData)
    );

    basketService.mergeBasket(sourceBasket, anyString()).subscribe(() => {
      verify(apiService.post(`baskets/${basketMockData.data.id}/merges`, anything(), anything())).once();
      done();
    });
  });

  it("should patch updated data to basket line item of a basket when 'updateBasketItem' is called", done => {
    when(apiService.patch(anyString(), anything(), anything())).thenReturn(of({}));

    const payload = { quantity: { value: 2 } } as BasketItemUpdateType;
    basketService.updateBasketItem(lineItemData.id, payload).subscribe(() => {
      verify(apiService.patch(`baskets/current/items/${lineItemData.id}`, payload, anything())).once();
      done();
    });
  });

  it("should remove line item from specific basket when 'deleteBasketItem' is called", done => {
    when(apiService.delete(anyString(), anything())).thenReturn(of({}));

    basketService.deleteBasketItem(lineItemData.id).subscribe(() => {
      verify(apiService.delete(`baskets/current/items/${lineItemData.id}`, anything())).once();
      done();
    });
  });

  it("should add promotion code to specific basket when 'addPromotionCodeToBasket' is called", done => {
    when(apiService.post(anything(), anything(), anything())).thenReturn(of({}));

    basketService.addPromotionCodeToBasket('code').subscribe(() => {
      verify(apiService.post(`baskets/current/promotioncodes`, anything(), anything())).once();
      done();
    });
  });

  it("should remove a promotion code from a specific basket when 'removePromotionCodeFromBasket' is called", done => {
    when(apiService.delete(anyString(), anything())).thenReturn(of({}));

    basketService.removePromotionCodeFromBasket('promoCode').subscribe(() => {
      verify(apiService.delete(`baskets/current/promotioncodes/promoCode`, anything())).once();
      done();
    });
  });

  it("should create a basket address when 'createBasketAddress' is called", done => {
    when(apiService.post(anyString(), anything(), anything())).thenReturn(of({ data: {} as Address }));

    basketService.createBasketAddress(BasketMockData.getAddress()).subscribe(() => {
      verify(apiService.post(`baskets/current/addresses`, anything(), anything())).once();
      done();
    });
  });

  it("should update a basket address when 'updateBasketAddress' is called", done => {
    when(apiService.patch(anyString(), anything(), anything())).thenReturn(of({ data: {} as Address }));

    const address = BasketMockData.getAddress();

    basketService.updateBasketAddress(address).subscribe(() => {
      verify(apiService.patch(`baskets/current/addresses/${address.id}`, anything(), anything())).once();
      done();
    });
  });

  it("should get eligible shipping methods for a basket when 'getBasketEligibleShippingMethods' is called", done => {
    when(apiService.get(anything(), anything())).thenReturn(of({ data: [] }));

    basketService.getBasketEligibleShippingMethods().subscribe(() => {
      verify(apiService.get(`baskets/current/eligible-shipping-methods`, anything())).once();
      done();
    });
  });
});
