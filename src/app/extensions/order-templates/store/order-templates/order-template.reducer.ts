import { EntityState, createEntityAdapter } from '@ngrx/entity';

import { HttpError } from 'ish-core/models/http-error/http-error.model';

import { OrderTemplate } from '../../models/order-templates/order-template.model';

import { OrderTemplateAction, OrderTemplatesActionTypes } from './order-template.actions';

export interface OrderTemplateState extends EntityState<OrderTemplate> {
  loading: boolean;
  selected: string;
  error: HttpError;
}

export const orderTemplateAdapter = createEntityAdapter<OrderTemplate>({
  selectId: orderTemplate => orderTemplate.id,
});

export const initialState = orderTemplateAdapter.getInitialState({
  loading: false,
  selected: undefined,
  error: undefined,
});

export function orderTemplateReducer(state = initialState, action: OrderTemplateAction): OrderTemplateState {
  switch (action.type) {
    case OrderTemplatesActionTypes.LoadOrderTemplates:
    case OrderTemplatesActionTypes.CreateOrderTemplate:
    case OrderTemplatesActionTypes.DeleteOrderTemplate:
    case OrderTemplatesActionTypes.UpdateOrderTemplate: {
      return {
        ...state,
        loading: true,
      };
    }
    case OrderTemplatesActionTypes.LoadOrderTemplatesFail:
    case OrderTemplatesActionTypes.DeleteOrderTemplateFail:
    case OrderTemplatesActionTypes.CreateOrderTemplateFail:
    case OrderTemplatesActionTypes.UpdateOrderTemplateFail: {
      const { error } = action.payload;
      return {
        ...state,
        loading: false,
        error,
        selected: undefined,
      };
    }

    case OrderTemplatesActionTypes.LoadOrderTemplatesSuccess: {
      const { orderTemplates } = action.payload;
      return orderTemplateAdapter.addAll(orderTemplates, {
        ...state,
        loading: false,
      });
    }
    case OrderTemplatesActionTypes.CreateOrderTemplateSuccess: {
      const { orderTemplate } = action.payload;

      return orderTemplateAdapter.upsertOne(orderTemplate, {
        ...state,
        selected: orderTemplate.id,
        loading: false,
      });
    }
    case OrderTemplatesActionTypes.UpdateOrderTemplateSuccess:
    case OrderTemplatesActionTypes.AddProductToOrderTemplateSuccess:
    case OrderTemplatesActionTypes.RemoveItemFromOrderTemplateSuccess: {
      const { orderTemplate } = action.payload;

      return orderTemplateAdapter.upsertOne(orderTemplate, {
        ...state,
        loading: false,
      });
    }

    case OrderTemplatesActionTypes.DeleteOrderTemplateSuccess: {
      const { orderTemplateId } = action.payload;
      return orderTemplateAdapter.removeOne(orderTemplateId, {
        ...state,
        loading: false,
      });
    }

    case OrderTemplatesActionTypes.SelectOrderTemplate: {
      const { id } = action.payload;
      return {
        ...state,
        selected: id,
      };
    }

    case OrderTemplatesActionTypes.ResetOrderTemplateState: {
      return initialState;
    }
  }

  return state;
}
