import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ReplaySubject, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import { Category } from 'ish-core/models/category/category.model';
import { ProductVariationHelper } from 'ish-core/models/product-variation/product-variation.helper';
import { VariationSelection } from 'ish-core/models/product-variation/variation-selection.model';
import { VariationProductView } from 'ish-core/models/product-view/product-view.model';
import { ProductHelper } from 'ish-core/models/product/product.model';
import { AddProductToBasket } from 'ish-core/store/checkout/basket';
import { ToggleCompare, isInCompareProducts } from 'ish-core/store/shopping/compare';
import {
  LoadProduct,
  getProduct,
  getProductEntities,
  getProductVariationOptions,
} from 'ish-core/store/shopping/products';

type ProductItemType = 'tile' | 'row';

@Component({
  selector: 'ish-product-item-container',
  templateUrl: './product-item.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItemContainerComponent implements OnInit, OnDestroy {
  @Input() productSku: string;
  @Input() category?: Category;
  @Input() type: ProductItemType;

  /** holds the current SKU */
  private sku$ = new ReplaySubject<string>(1);

  private product$ = this.sku$.pipe(switchMap(sku => this.store.pipe(select(getProduct, { sku }))));
  /** display loading overlay while product is loading */
  loading$ = this.product$.pipe(map(p => !(ProductHelper.isProductCompletelyLoaded(p) || (p && p.failed))));
  /** display only completely loaded (or failed) products to prevent flickering */
  productForDisplay$ = this.product$.pipe(filter(p => p && (p.failed || ProductHelper.isProductCompletelyLoaded(p))));
  productVariationOptions$ = this.sku$.pipe(
    switchMap(sku => this.store.pipe(select(getProductVariationOptions, { sku })))
  );
  isInCompareList$ = this.sku$.pipe(switchMap(sku => this.store.pipe(select(isInCompareProducts(sku)))));

  private destroy$ = new Subject();

  constructor(private store: Store<{}>) {}

  ngOnInit() {
    // Checks if the product is already in the store and only dispatches a LoadProduct action if it is not
    this.sku$
      .pipe(
        withLatestFrom(this.store.pipe(select(getProductEntities))),
        map(([sku, entities]) => entities[sku]),
        filter(product => !ProductHelper.isProductCompletelyLoaded(product)),
        withLatestFrom(this.sku$),
        takeUntil(this.destroy$)
      )
      .subscribe(([, sku]) => this.store.dispatch(new LoadProduct({ sku })));

    this.sku$.next(this.productSku);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  toggleCompare() {
    this.sku$.pipe(take(1)).subscribe(sku => this.store.dispatch(new ToggleCompare({ sku })));
  }

  addToBasket(quantity: number) {
    this.sku$.pipe(take(1)).subscribe(sku => this.store.dispatch(new AddProductToBasket({ sku, quantity })));
  }

  replaceVariation(selection: VariationSelection) {
    this.product$
      .pipe(
        take(1),
        filter<VariationProductView>(product => ProductHelper.isVariationProduct(product))
      )
      .subscribe(product => {
        const { sku } = ProductVariationHelper.findPossibleVariationForSelection(selection, product);
        this.sku$.next(sku);
      });
  }

  get isTile() {
    return this.type === 'tile';
  }

  get isRow() {
    return this.type === 'row';
  }
}