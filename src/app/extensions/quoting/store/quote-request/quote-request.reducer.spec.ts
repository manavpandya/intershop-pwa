import { HttpError } from 'ish-core/models/http-error/http-error.model';

import { QuoteLineItemResult } from '../../models/quote-line-item-result/quote-line-item-result.model';
import { QuoteRequestItem } from '../../models/quote-request-item/quote-request-item.model';
import { QuoteRequestData } from '../../models/quote-request/quote-request.interface';

import {
  addBasketToQuoteRequest,
  addBasketToQuoteRequestFail,
  addBasketToQuoteRequestSuccess,
  addProductToQuoteRequest,
  addProductToQuoteRequestFail,
  addProductToQuoteRequestSuccess,
  addQuoteRequest,
  addQuoteRequestFail,
  addQuoteRequestSuccess,
  createQuoteRequestFromQuoteRequest,
  createQuoteRequestFromQuoteRequestFail,
  createQuoteRequestFromQuoteRequestSuccess,
  deleteItemFromQuoteRequest,
  deleteItemFromQuoteRequestFail,
  deleteItemFromQuoteRequestSuccess,
  deleteQuoteRequest,
  deleteQuoteRequestFail,
  deleteQuoteRequestSuccess,
  loadQuoteRequestItems,
  loadQuoteRequestItemsFail,
  loadQuoteRequestItemsSuccess,
  loadQuoteRequests,
  loadQuoteRequestsFail,
  loadQuoteRequestsSuccess,
  selectQuoteRequest,
  submitQuoteRequest,
  submitQuoteRequestFail,
  submitQuoteRequestSuccess,
  updateQuoteRequest,
  updateQuoteRequestFail,
  updateQuoteRequestItems,
  updateQuoteRequestItemsFail,
  updateQuoteRequestItemsSuccess,
  updateQuoteRequestSuccess,
} from './quote-request.actions';
import { initialState, quoteRequestReducer } from './quote-request.reducer';

describe('Quote Request Reducer', () => {
  describe('SelectQuoteRequest', () => {
    it('should select a quote request when reduced', () => {
      const action = selectQuoteRequest({ payload: { id: 'test' } });
      const state = quoteRequestReducer(initialState, action);

      expect(state.selected).toEqual('test');
    });
  });

  describe('LoadQuoteRequests actions', () => {
    describe('LoadQuoteRequests action', () => {
      it('should set loading to true', () => {
        const action = loadQuoteRequests();
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('LoadQuoteRequestsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = loadQuoteRequestsFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('LoadQuoteRequestsSuccess action', () => {
      it('should set quote requests and set loading to false', () => {
        const quoteRequests = [
          {
            id: 'test',
          } as QuoteRequestData,
        ];

        const action = loadQuoteRequestsSuccess({ payload: { quoteRequests } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.ids).toEqual(['test']);
        expect(state.entities).toEqual({ test: quoteRequests[0] });
        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('AddQuoteRequest actions', () => {
    describe('AddQuoteRequest action', () => {
      it('should set loading to true', () => {
        const action = addQuoteRequest();
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('AddQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = addQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('AddQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const action = addQuoteRequestSuccess({ payload: { id: 'test' } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('UpdateQuoteRequest actions', () => {
    describe('UpdateQuoteRequest action', () => {
      it('should set loading to true', () => {
        const displayName = 'test';
        const action = updateQuoteRequest({ payload: { displayName } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('UpdateQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = updateQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('UpdateQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const quoteRequest = { id: 'test' } as QuoteRequestData;
        const action = updateQuoteRequestSuccess({ payload: { quoteRequest } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('DeleteQuoteRequest actions', () => {
    describe('DeleteQuoteRequest action', () => {
      it('should set loading to true', () => {
        const id = 'test';
        const action = deleteQuoteRequest({ payload: { id } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('DeleteQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = deleteQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('DeleteQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const id = 'test';
        const action = deleteQuoteRequestSuccess({ payload: { id } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('SubmitQuoteRequest actions', () => {
    describe('SubmitQuoteRequest action', () => {
      it('should set loading to true', () => {
        const action = submitQuoteRequest();
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('SubmitQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = submitQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('SubmitQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const id = 'test';
        const action = submitQuoteRequestSuccess({ payload: { id } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('CreateQuoteRequestFromQuoteRequest actions', () => {
    describe('CreateQuoteRequestFromQuoteRequest action', () => {
      it('should set loading to true', () => {
        const action = createQuoteRequestFromQuoteRequest({ payload: {} });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('CreateQuoteRequestFromQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = createQuoteRequestFromQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('CreateQuoteRequestFromQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const quoteLineItemResult = {} as QuoteLineItemResult;
        const action = createQuoteRequestFromQuoteRequestSuccess({ payload: { quoteLineItemResult } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('LoadQuoteRequestItems actions', () => {
    describe('LoadQuoteRequestItems action', () => {
      it('should set loading to true', () => {
        const id = 'test';
        const action = loadQuoteRequestItems({ payload: { id } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('LoadQuoteRequestItemsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = loadQuoteRequestItemsFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('LoadQuoteRequestItemsSuccess action', () => {
      it('should set loading to false', () => {
        const quoteRequestItems = {
          quoteRequestItems: [
            {
              id: 'test',
            } as QuoteRequestItem,
          ],
        };

        const action = loadQuoteRequestItemsSuccess({ payload: quoteRequestItems });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.quoteRequestItems).toEqual(quoteRequestItems.quoteRequestItems);
      });
    });
  });

  describe('AddProductToQuoteRequest actions', () => {
    describe('AddProductToQuoteRequest action', () => {
      it('should set loading to true', () => {
        const payload = {
          quoteRequestId: 'test',
          sku: 'test',
          quantity: 1,
        };
        const action = addProductToQuoteRequest({ payload });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('AddProductToQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = addProductToQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('AddProductToQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const id = 'test';
        const action = addProductToQuoteRequestSuccess({ payload: { id } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('AddBasketToQuoteRequest actions', () => {
    describe('AddBasketToQuoteRequest action', () => {
      it('should set loading to true', () => {
        const action = addBasketToQuoteRequest();
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('AddBasketToQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = addBasketToQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('AddBasketToQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const action = addBasketToQuoteRequestSuccess({ payload: { id: 'QRID' } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('UpdateQuoteRequestItems actions', () => {
    describe('UpdateQuoteRequestItems action', () => {
      it('should set loading to true', () => {
        const lineItemUpdates = [{ itemId: 'test', quantity: 1 }];
        const action = updateQuoteRequestItems({ payload: { lineItemUpdates } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('UpdateQuoteRequestItemsFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = updateQuoteRequestItemsFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('UpdateQuoteRequestItemsSuccess action', () => {
      it('should set loading to false', () => {
        const itemIds = ['test'];
        const action = updateQuoteRequestItemsSuccess({ payload: { itemIds } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });

  describe('DeleteItemFromQuoteRequest actions', () => {
    describe('DeleteItemFromQuoteRequest action', () => {
      it('should set loading to true', () => {
        const payload = {
          quoteRequestId: 'test',
          itemId: 'test',
        };
        const action = deleteItemFromQuoteRequest({ payload });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeTrue();
      });
    });

    describe('DeleteItemFromQuoteRequestFail action', () => {
      it('should set loading to false', () => {
        const error = { message: 'invalid' } as HttpError;
        const action = deleteItemFromQuoteRequestFail({ payload: { error } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);
      });
    });

    describe('DeleteItemFromQuoteRequestSuccess action', () => {
      it('should set loading to false', () => {
        const id = 'test';
        const action = deleteItemFromQuoteRequestSuccess({ payload: { id } });
        const state = quoteRequestReducer(initialState, action);

        expect(state.loading).toBeFalse();
      });
    });
  });
});
