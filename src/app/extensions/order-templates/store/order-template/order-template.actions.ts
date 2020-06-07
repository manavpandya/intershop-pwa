import { createAction, props } from '@ngrx/store';

import { HttpError } from 'ish-core/models/http-error/http-error.model';

import { OrderTemplate, OrderTemplateHeader } from '../../models/order-template/order-template.model';
export const loadOrderTemplates = createAction('[Order Templates Internal] Load Order Templates');

export const loadOrderTemplatesSuccess = createAction(
  '[Order Templates API] Load Order Templates Success',
  props<{ payload: { orderTemplates: OrderTemplate[] } }>()
);

export const loadOrderTemplatesFail = createAction(
  '[Order Templates API] Load Order Templates Fail',
  props<{ payload: { error: HttpError } }>()
);

export const createOrderTemplate = createAction(
  '[Order Templates] Create Order Template',
  props<{ payload: { orderTemplate: OrderTemplateHeader } }>()
);

export const createOrderTemplateSuccess = createAction(
  '[Order Templates API] Create Order Template Success',
  props<{ payload: { orderTemplate: OrderTemplate } }>()
);

export const createOrderTemplateFail = createAction(
  '[Order Templates API] Create Order Template Fail',
  props<{ payload: { error: HttpError } }>()
);

export const updateOrderTemplate = createAction(
  '[Order Templates] Update Order Template',
  props<{ payload: { orderTemplate: OrderTemplate } }>()
);

export const updateOrderTemplateSuccess = createAction(
  '[Order Templates API] Update Order Template Success',
  props<{ payload: { orderTemplate: OrderTemplate } }>()
);

export const updateOrderTemplateFail = createAction(
  '[Order Templates API] Update Order Template Fail',
  props<{ payload: { error: HttpError } }>()
);

export const deleteOrderTemplate = createAction(
  '[Order Templates] Delete Order Template',
  props<{ payload: { orderTemplateId: string } }>()
);

export const deleteOrderTemplateSuccess = createAction(
  '[Order Templates API] Delete Order Template Success',
  props<{ payload: { orderTemplateId: string } }>()
);

export const deleteOrderTemplateFail = createAction(
  '[Order Templates API] Delete Order Template Fail',
  props<{ payload: { error: HttpError } }>()
);

export const addProductToOrderTemplate = createAction(
  '[Order Templates] Add Item to Order Template',
  props<{ payload: { orderTemplateId: string; sku: string; quantity?: number } }>()
);

export const addProductToOrderTemplateSuccess = createAction(
  '[Order Templates API] Add Item to Order Template Success',
  props<{ payload: { orderTemplate: OrderTemplate } }>()
);

export const addProductToOrderTemplateFail = createAction(
  '[Order Templates API] Add Item to Order Template Fail',
  props<{ payload: { error: HttpError } }>()
);

export const addProductToNewOrderTemplate = createAction(
  '[Order Templates Internal] Add Product To New Order Template',
  props<{ payload: { title: string; sku: string; quantity?: number } }>()
);

export const moveItemToOrderTemplate = createAction(
  '[Order Templates] Move Item to another Order Template',
  props<{
    payload: { source: { id: string }; target: { id?: string; title?: string; sku: string; quantity: number } };
  }>()
);

export const removeItemFromOrderTemplate = createAction(
  '[Order Templates] Remove Item from Order Template',
  props<{ payload: { orderTemplateId: string; sku: string } }>()
);

export const removeItemFromOrderTemplateSuccess = createAction(
  '[Order Templates API] Remove Item from Order Template Success',
  props<{ payload: { orderTemplate: OrderTemplate } }>()
);

export const removeItemFromOrderTemplateFail = createAction(
  '[Order Templates API] Remove Item from Order Template Fail',
  props<{ payload: { error: HttpError } }>()
);

export const selectOrderTemplate = createAction(
  '[Order Templates Internal] Select Order Template',
  props<{ payload: { id: string } }>()
);

export const addBasketToNewOrderTemplate = createAction(
  '[Order Templates] Add basket to New Order Template]',
  props<{ payload: { orderTemplate: OrderTemplateHeader } }>()
);

export const addBasketToNewOrderTemplateFail = createAction(
  '[Order Templates] Add basket to New Order Template Fail]',
  props<{ payload: { error: HttpError } }>()
);

export const addBasketToNewOrderTemplateSuccess = createAction(
  '[Order Templates] Add basket to New Order Template Success]',
  props<{ payload: { orderTemplate: OrderTemplate } }>()
);
