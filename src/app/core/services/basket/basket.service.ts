import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, distinctUntilChanged, map, shareReplay, take } from 'rxjs/operators';

import { AddressMapper } from 'ish-core/models/address/address.mapper';
import { Address } from 'ish-core/models/address/address.model';
import { BasketInfoMapper } from 'ish-core/models/basket-info/basket-info.mapper';
import { BasketInfo } from 'ish-core/models/basket-info/basket-info.model';
import { BasketMergeHelper } from 'ish-core/models/basket-merge/basket-merge.helper';
import { BasketMergeData } from 'ish-core/models/basket-merge/basket-merge.interface';
import { BasketValidationData } from 'ish-core/models/basket-validation/basket-validation.interface';
import { BasketValidationMapper } from 'ish-core/models/basket-validation/basket-validation.mapper';
import { BasketValidation, BasketValidationScopeType } from 'ish-core/models/basket-validation/basket-validation.model';
import { BasketBaseData, BasketData } from 'ish-core/models/basket/basket.interface';
import { BasketMapper } from 'ish-core/models/basket/basket.mapper';
import { Basket } from 'ish-core/models/basket/basket.model';
import { ShippingMethodData } from 'ish-core/models/shipping-method/shipping-method.interface';
import { ShippingMethodMapper } from 'ish-core/models/shipping-method/shipping-method.mapper';
import { ShippingMethod } from 'ish-core/models/shipping-method/shipping-method.model';
import { ApiService, unpackEnvelope } from 'ish-core/services/api/api.service';
import { getCurrentBasket, getCurrentBasketId } from 'ish-core/store/checkout/basket/basket.selectors';

export type BasketUpdateType =
  | { invoiceToAddress: string }
  | { commonShipToAddress: string }
  | { commonShippingMethod: string }
  | { calculated: boolean };
export type BasketItemUpdateType =
  | { quantity?: { value: number; unit: string }; product?: string }
  | { shippingMethod: { id: string } };

type BasketIncludeType =
  | 'invoiceToAddress'
  | 'commonShipToAddress'
  | 'commonShippingMethod'
  | 'discounts'
  | 'lineItems_discounts'
  | 'lineItems'
  | 'payments'
  | 'payments_paymentMethod'
  | 'payments_paymentInstrument';

type MergeBasketIncludeType =
  | 'targetBasket'
  | 'targetBasket_invoiceToAddress'
  | 'targetBasket_commonShipToAddress'
  | 'targetBasket_commonShippingMethod'
  | 'targetBasket_discounts'
  | 'targetBasket_lineItems_discounts'
  | 'targetBasket_lineItems'
  | 'targetBasket_payments'
  | 'targetBasket_payments_paymentMethod'
  | 'targetBasket_payments_paymentInstrument';

type ValidationBasketIncludeType =
  | 'basket'
  | 'basket_invoiceToAddress'
  | 'basket_commonShipToAddress'
  | 'basket_commonShippingMethod'
  | 'basket_discounts'
  | 'basket_lineItems_discounts'
  | 'basket_lineItems'
  | 'basket_payments'
  | 'basket_payments_paymentMethod'
  | 'basket_payments_paymentInstrument';

/**
 * The Basket Service handles the interaction with the 'baskets' REST API.
 */
@Injectable({ providedIn: 'root' })
export class BasketService {
  private basketId$: Observable<string>;
  constructor(private apiService: ApiService, private store: Store<{}>) {
    // rebuild the stream everytime the selected id switches back to undefined
    store
      .pipe(
        select(getCurrentBasket),
        distinctUntilChanged()
      )
      .subscribe(() => this.buildBasketStream());
  }

  // http header for Basket API v1
  private basketHeaders = new HttpHeaders({
    'content-type': 'application/json',
    Accept: 'application/vnd.intershop.basket.v1+json',
  });

  private allBasketIncludes: BasketIncludeType[] = [
    'invoiceToAddress',
    'commonShipToAddress',
    'commonShippingMethod',
    'discounts',
    'lineItems_discounts',
    'lineItems',
    'payments',
    'payments_paymentMethod',
    'payments_paymentInstrument',
  ];

  private allTargetBasketIncludes: MergeBasketIncludeType[] = [
    'targetBasket',
    'targetBasket_invoiceToAddress',
    'targetBasket_commonShipToAddress',
    'targetBasket_commonShippingMethod',
    'targetBasket_discounts',
    'targetBasket_lineItems_discounts',
    'targetBasket_lineItems',
    'targetBasket_payments',
    'targetBasket_payments_paymentMethod',
    'targetBasket_payments_paymentInstrument',
  ];

  private allBasketValidationIncludes: ValidationBasketIncludeType[] = [
    'basket',
    'basket_invoiceToAddress',
    'basket_commonShipToAddress',
    'basket_commonShippingMethod',
    'basket_discounts',
    'basket_lineItems_discounts',
    'basket_lineItems',
    'basket_payments',
    'basket_payments_paymentMethod',
    'basket_payments_paymentInstrument',
  ];

  /**
   * Get the basket for the given basket id or fallback to 'current' as basket id to get the current basket for the current user.
   * @returns         The basket.
   */
  getBasket(): Observable<Basket> {
    return this.createOrLoadCurrentBasket();
  }

  getBasketByToken(apiToken: string): Observable<Basket> {
    const params = new HttpParams().set('include', this.allBasketIncludes.join());

    return this.apiService
      .get<BasketData>(`baskets/current`, {
        headers: this.basketHeaders.set(ApiService.TOKEN_HEADER_KEY, apiToken),
        params,
        skipApiErrorHandling: true,
        runExclusively: true,
      })
      .pipe(
        map(BasketMapper.fromData),
        // tslint:disable-next-line:ban
        catchError(() => EMPTY)
      );
  }

  /**
   * Creates a basket for the current user.
   * @returns         The basket.
   */
  createBasket(): Observable<Basket> {
    return this.apiService
      .post<BasketData>(
        `baskets`,
        {},
        {
          headers: this.basketHeaders,
        }
      )
      .pipe(map(BasketMapper.fromData));
  }

  /**
   * Merge the source basket (named in payload) into the current basket.
   * @param sourceBasketId  The id of the source basket.
   * @param authToken       The token value of the source basket owner.
   * @returns               The merged basket.
   */
  mergeBasket(sourceBasketId: string, authToken: string): Observable<Basket> {
    if (!sourceBasketId) {
      return throwError('mergeBasket() called without sourceBasketId');
    }
    if (!authToken) {
      return throwError('mergeBasket() called without authToken');
    }
    const params = new HttpParams().set('include', this.allTargetBasketIncludes.join());
    return this.createOrLoadCurrentBasket().pipe(
      concatMap(basket =>
        this.apiService
          .post<BasketMergeData>(
            `baskets/${basket.id}/merges`,
            { sourceBasket: sourceBasketId, sourceAuthenticationToken: authToken },
            {
              headers: this.basketHeaders,
              params,
            }
          )
          .pipe(map(mergeBasketData => BasketMapper.fromData(BasketMergeHelper.transform(mergeBasketData))))
      )
    );
  }

  /**
   * Updates the basket for the given basket id or fallback to 'current' as basket id.
   * @param body      Basket related data (invoice address, shipping address, shipping method ...), which should be changed
   * @returns         The changed basket.
   */
  updateBasket(body: BasketUpdateType): Observable<Basket> {
    if (!body) {
      return throwError('updateBasket() called without body');
    }

    const params = new HttpParams().set('include', this.allBasketIncludes.join());
    return this.apiService
      .patch<BasketData>(`baskets/current`, body, {
        headers: this.basketHeaders,
        params,
      })
      .pipe(map(BasketMapper.fromData));
  }

  /**
   * Validates the basket for the given basket id.
   * @param basketId  The basket id. (default: current)
   * @param scopes    Basket scopes which should be validated ( see also BasketValidationScopeType ), default: minimal scope (max items limit, empty basket)
   * @returns         The (adjusted) basket and the validation results.
   */
  validateBasket(scopes: BasketValidationScopeType[] = ['']): Observable<BasketValidation> {
    const body = {
      basket: 'current',
      adjustmentsAllowed: !scopes.some(scope => scope === 'All'), // don't allow adjustments for 'All' validation steps, because you cannot show them to the user at once
      scopes,
    };

    const params = new HttpParams().set('include', this.allBasketValidationIncludes.join());
    return this.apiService
      .post<BasketValidationData>(`baskets/current/validations`, body, {
        headers: this.basketHeaders,
        params,
      })
      .pipe(map(BasketValidationMapper.fromData));
  }

  /**
   * Returns the list of active baskets for the current user. The first basket is the last modified basket.
   * Use this method to check if the user has at least one active basket
   * @returns         An array of basket base data.
   */
  getBaskets(): Observable<BasketBaseData[]> {
    return this.apiService
      .get(`baskets`, {
        headers: this.basketHeaders,
      })
      .pipe(unpackEnvelope<BasketBaseData>('data'));
  }

  /**
   * Adds a list of items with the given sku and quantity to the given basket.
   * @param items     The list of product SKU and quantity pairs to be added to the basket.
   */
  addItemsToBasket(items: { sku: string; quantity: number; unit: string }[]): Observable<BasketInfo[]> {
    if (!items) {
      return throwError('addItemsToBasket() called without items');
    }

    const body = items.map(item => ({
      product: item.sku,
      quantity: {
        value: item.quantity,
        unit: item.unit,
      },
    }));

    return this.basketId$.pipe(
      concatMap(basketId =>
        this.apiService
          .post(`baskets/${basketId}/items`, body, {
            headers: this.basketHeaders,
          })
          .pipe(map(BasketInfoMapper.fromInfo))
      )
    );
  }

  /**
   * Add a promotion code to basket.
   * @param codeStr   The code string of the promotion code that should be added to basket.
   * @returns         The info message after creation.
   */
  addPromotionCodeToBasket(codeStr: string): Observable<string> {
    const body = {
      code: codeStr,
    };

    return this.apiService
      .post(`baskets/current/promotioncodes`, body, {
        headers: this.basketHeaders,
      })
      .pipe(map(({ infos }) => infos && infos[0] && infos[0].message));
  }

  /**
   * Remove a promotion code from basket.
   * @param codeStr   The code string of the promotion code that should be removed from basket.
   */
  removePromotionCodeFromBasket(codeStr: string): Observable<string> {
    return this.apiService.delete(`baskets/current/promotioncodes/${codeStr}`, {
      headers: this.basketHeaders,
    });
  }

  /**
   * Updates specific line items (quantity/shipping method) for the given basket.
   * @param itemId    The id of the line item that should be updated.
   * @param body      request body
   * @returns         Possible infos after the update.
   */
  updateBasketItem(itemId: string, body: BasketItemUpdateType): Observable<BasketInfo[]> {
    return this.apiService
      .patch<{ infos: BasketInfo[] }>(`baskets/current/items/${itemId}`, body, {
        headers: this.basketHeaders,
      })
      .pipe(
        map(payload => ({ ...payload, itemId })),
        map(BasketInfoMapper.fromInfo)
      );
  }

  /**
   * Remove specific line item from the given basket.
   * @param itemId    The id of the line item that should be deleted.
   */
  deleteBasketItem(itemId: string): Observable<BasketInfo[]> {
    return this.apiService
      .delete<{ infos: BasketInfo[] }>(`baskets/current/items/${itemId}`, {
        headers: this.basketHeaders,
      })

      .pipe(
        map(payload => ({ ...payload, itemId })),
        map(BasketInfoMapper.fromInfo)
      );
  }

  /**
   * Create a basket address for the selected basket of an anonymous user.
   * @param address   The address which should be created
   * @returns         The new basket address.
   */
  createBasketAddress(address: Address): Observable<Address> {
    if (!address) {
      return throwError('createBasketAddress() called without address');
    }

    return this.apiService
      .post(`baskets/current/addresses`, address, {
        headers: this.basketHeaders,
      })
      .pipe(
        map(({ data }) => data),
        map(AddressMapper.fromData)
      );
  }

  /**
   * Updates partly or completely an address for the selected basket of an anonymous user.
   * @param address   The address data which should be updated
   * @returns         The new basket address.
   */
  updateBasketAddress(address: Address): Observable<Address> {
    if (!address) {
      return throwError('updateBasketAddress() called without address');
    }
    if (!address.id) {
      return throwError('updateBasketAddress() called without addressId');
    }

    return this.apiService
      .patch(`baskets/current/addresses/${address.id}`, address, {
        headers: this.basketHeaders,
      })
      .pipe(
        map(({ data }) => data),
        map(AddressMapper.fromData)
      );
  }

  /**
   * Get eligible shipping methods for the selected basket or for the selected bucket of a basket.
   * @param bucketId  The bucket id.
   * @returns         The eligible shipping methods.
   */
  getBasketEligibleShippingMethods(bucketId?: string): Observable<ShippingMethod[]> {
    return bucketId
      ? this.apiService
          .get(`baskets/current/buckets/${bucketId}/eligible-shipping-methods`, {
            headers: this.basketHeaders,
          })
          .pipe(
            unpackEnvelope<ShippingMethodData>('data'),
            map(data => data.map(ShippingMethodMapper.fromData))
          )
      : this.apiService
          .get(`baskets/current/eligible-shipping-methods`, {
            headers: this.basketHeaders,
          })
          .pipe(
            unpackEnvelope<ShippingMethodData>('data'),
            map(data => data.map(ShippingMethodMapper.fromData))
          );
  }

  private loadBasket(): Observable<Basket> {
    const params = new HttpParams().set('include', this.allBasketIncludes.join());
    return this.apiService
      .get<BasketData>(`baskets/current`, {
        headers: this.basketHeaders,
        params,
      })
      .pipe(map(BasketMapper.fromData));
  }

  /**
   * Build basket stream
   * selects or creates editable quote request
   */
  private buildBasketStream() {
    this.basketId$ = this.store.pipe(select(getCurrentBasketId)).pipe(
      take(1),
      concatMap(basketId =>
        basketId ? of(basketId) : this.createOrLoadCurrentBasket().pipe(map(basket => basket.id))
      ),
      shareReplay(1)
    );
  }

  /**
   * Build currentBasket stream
   * gets or creates the basket of the current user
   */
  private createOrLoadCurrentBasket(): Observable<Basket> {
    return this.getBaskets().pipe(
      concatMap(baskets => (baskets && baskets.length ? this.loadBasket() : this.createBasket()))
    );
  }
}
