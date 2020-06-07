import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { concat } from 'rxjs';
import { concatMap, filter, last, map, mapTo, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';

import { getCurrentBasket } from 'ish-core/store/account/basket';
import { getUserAuthorized } from 'ish-core/store/account/user';
import { displaySuccessMessage } from 'ish-core/store/core/messages';
import { selectRouteParam } from 'ish-core/store/core/router';
import { setBreadcrumbData } from 'ish-core/store/core/viewconf';
import {
  distinctCompareWith,
  mapErrorToAction,
  mapToPayload,
  mapToPayloadProperty,
  whenTruthy,
} from 'ish-core/utils/operators';

import { OrderTemplate, OrderTemplateHeader } from '../../models/order-template/order-template.model';
import { OrderTemplateService } from '../../services/order-template/order-template.service';

import {
  addBasketToNewOrderTemplate,
  addBasketToNewOrderTemplateFail,
  addBasketToNewOrderTemplateSuccess,
  addProductToNewOrderTemplate,
  addProductToOrderTemplate,
  addProductToOrderTemplateFail,
  addProductToOrderTemplateSuccess,
  createOrderTemplate,
  createOrderTemplateFail,
  createOrderTemplateSuccess,
  deleteOrderTemplate,
  deleteOrderTemplateFail,
  deleteOrderTemplateSuccess,
  loadOrderTemplates,
  loadOrderTemplatesFail,
  loadOrderTemplatesSuccess,
  moveItemToOrderTemplate,
  removeItemFromOrderTemplate,
  removeItemFromOrderTemplateFail,
  removeItemFromOrderTemplateSuccess,
  selectOrderTemplate,
  updateOrderTemplate,
  updateOrderTemplateFail,
  updateOrderTemplateSuccess,
} from './order-template.actions';
import {
  getOrderTemplateDetails,
  getSelectedOrderTemplateDetails,
  getSelectedOrderTemplateId,
} from './order-template.selectors';

@Injectable()
export class OrderTemplateEffects {
  constructor(private actions$: Actions, private orderTemplateService: OrderTemplateService, private store: Store) {}

  loadOrderTemplates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOrderTemplates),
      withLatestFrom(this.store.pipe(select(getUserAuthorized))),
      filter(([, authorized]) => authorized),
      switchMap(() =>
        this.orderTemplateService.getOrderTemplates().pipe(
          map(orderTemplates => loadOrderTemplatesSuccess({ payload: { orderTemplates } })),
          mapErrorToAction(loadOrderTemplatesFail)
        )
      )
    )
  );

  createOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createOrderTemplate),
      mapToPayloadProperty('orderTemplate'),
      mergeMap((orderTemplateData: OrderTemplateHeader) =>
        this.orderTemplateService.createOrderTemplate(orderTemplateData).pipe(
          mergeMap(orderTemplate => [
            createOrderTemplateSuccess({ payload: { orderTemplate } }),
            displaySuccessMessage({
              payload: {
                message: 'account.order_template.new_order_template.confirmation',
                messageParams: { 0: orderTemplate.title },
              },
            }),
          ]),
          mapErrorToAction(createOrderTemplateFail)
        )
      )
    )
  );

  addBasketToNewOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addBasketToNewOrderTemplate),
      mapToPayload(),
      mergeMap(payload =>
        this.orderTemplateService
          .createOrderTemplate({
            title: payload.orderTemplate.title,
          })
          .pipe(
            withLatestFrom(this.store.pipe(select(getCurrentBasket))),
            // use created order template data to dispatch addProduct action
            concatMap(([orderTemplate, currentBasket]) =>
              concat(
                ...currentBasket.lineItems.map(lineItem =>
                  this.orderTemplateService.addProductToOrderTemplate(
                    orderTemplate.id,
                    lineItem.productSKU,
                    lineItem.quantity.value
                  )
                )
              ).pipe(
                last(),
                concatMap(newOrderTemplate => [
                  addBasketToNewOrderTemplateSuccess({ payload: { orderTemplate: newOrderTemplate } }),
                  displaySuccessMessage({
                    payload: {
                      message: 'account.order_template.new_from_basket_confirm.heading',
                      messageParams: { 0: orderTemplate.title },
                    },
                  }),
                ]),
                mapErrorToAction(addBasketToNewOrderTemplateFail)
              )
            )
          )
      ),
      mapErrorToAction(createOrderTemplateFail)
    )
  );

  deleteOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteOrderTemplate),
      mapToPayloadProperty('orderTemplateId'),
      mergeMap(orderTemplateId => this.store.pipe(select(getOrderTemplateDetails, { id: orderTemplateId }))),
      whenTruthy(),
      map(orderTemplate => ({ orderTemplateId: orderTemplate.id, title: orderTemplate.title })),
      mergeMap(({ orderTemplateId, title }) =>
        this.orderTemplateService.deleteOrderTemplate(orderTemplateId).pipe(
          mergeMap(() => [
            deleteOrderTemplateSuccess({ payload: { orderTemplateId } }),
            displaySuccessMessage({
              payload: {
                message: 'account.order_template.delete_order_template.confirmation',
                messageParams: { 0: title },
              },
            }),
          ]),
          mapErrorToAction(deleteOrderTemplateFail)
        )
      )
    )
  );

  updateOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOrderTemplate),
      mapToPayloadProperty('orderTemplate'),
      mergeMap((newOrderTemplate: OrderTemplate) =>
        this.orderTemplateService.updateOrderTemplate(newOrderTemplate).pipe(
          mergeMap(orderTemplate => [
            updateOrderTemplateSuccess({ payload: { orderTemplate } }),
            displaySuccessMessage({
              payload: {
                message: 'account.order_templates.edit.confirmation',
                messageParams: { 0: orderTemplate.title },
              },
            }),
          ]),
          mapErrorToAction(updateOrderTemplateFail)
        )
      )
    )
  );

  addProductToOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProductToOrderTemplate),
      mapToPayload(),
      mergeMap(payload =>
        this.orderTemplateService
          .addProductToOrderTemplate(payload.orderTemplateId, payload.sku, payload.quantity)
          .pipe(
            map(orderTemplate => addProductToOrderTemplateSuccess({ payload: { orderTemplate } })),
            mapErrorToAction(addProductToOrderTemplateFail)
          )
      )
    )
  );

  addProductToNewOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProductToNewOrderTemplate),
      mapToPayload(),
      mergeMap(payload =>
        this.orderTemplateService
          .createOrderTemplate({
            title: payload.title,
          })
          .pipe(
            // use created order template data to dispatch addProduct action
            mergeMap(orderTemplate => [
              createOrderTemplateSuccess({ payload: { orderTemplate } }),
              addProductToOrderTemplate({
                payload: {
                  orderTemplateId: orderTemplate.id,
                  sku: payload.sku,
                  quantity: payload.quantity,
                },
              }),
              selectOrderTemplate({ payload: { id: orderTemplate.id } }),
            ]),
            mapErrorToAction(createOrderTemplateFail)
          )
      )
    )
  );

  moveItemToOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(moveItemToOrderTemplate),
      mapToPayload(),
      mergeMap(payload => {
        if (!payload.target.id) {
          return [
            addProductToNewOrderTemplate({
              payload: {
                title: payload.target.title,
                sku: payload.target.sku,
                quantity: payload.target.quantity,
              },
            }),
            removeItemFromOrderTemplate({
              payload: {
                orderTemplateId: payload.source.id,
                sku: payload.target.sku,
              },
            }),
          ];
        } else {
          return [
            addProductToOrderTemplate({
              payload: {
                orderTemplateId: payload.target.id,
                sku: payload.target.sku,
                quantity: payload.target.quantity,
              },
            }),
            removeItemFromOrderTemplate({
              payload: {
                orderTemplateId: payload.source.id,
                sku: payload.target.sku,
              },
            }),
          ];
        }
      })
    )
  );

  removeProductFromOrderTemplate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeItemFromOrderTemplate),
      mapToPayload(),
      mergeMap(payload =>
        this.orderTemplateService.removeProductFromOrderTemplate(payload.orderTemplateId, payload.sku).pipe(
          map(orderTemplate => removeItemFromOrderTemplateSuccess({ payload: { orderTemplate } })),
          mapErrorToAction(removeItemFromOrderTemplateFail)
        )
      )
    )
  );

  routeListenerForSelectedOrderTemplate$ = createEffect(() =>
    this.store.pipe(
      select(selectRouteParam('orderTemplateName')),
      distinctCompareWith(this.store.pipe(select(getSelectedOrderTemplateId))),
      map(id => selectOrderTemplate({ payload: { id } }))
    )
  );

  /**
   * Trigger LoadOrderTemplates action after LoginUserSuccess.
   */
  loadOrderTemplatesAfterLogin$ = createEffect(() =>
    this.store.pipe(select(getUserAuthorized), whenTruthy(), mapTo(loadOrderTemplates()))
  );

  setOrderTemplateBreadcrumb$ = createEffect(() =>
    this.store.pipe(
      select(getSelectedOrderTemplateDetails),
      whenTruthy(),
      map(orderTemplate =>
        setBreadcrumbData({
          payload: {
            breadcrumbData: [
              { key: 'account.ordertemplates.link', link: '/account/order-templates' },
              { text: orderTemplate.title },
            ],
          },
        })
      )
    )
  );
}
