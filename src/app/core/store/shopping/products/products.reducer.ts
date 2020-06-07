import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { AllProductTypes } from 'ish-core/models/product/product.model';

import {
  loadProductBundlesSuccess,
  loadProductFail,
  loadProductLinksSuccess,
  loadProductSuccess,
  loadProductVariationsFail,
  loadProductVariationsSuccess,
  loadRetailSetSuccess,
} from './products.actions';

export const productAdapter = createEntityAdapter<AllProductTypes>({
  selectId: product => product.sku,
});

export interface ProductsState extends EntityState<AllProductTypes> {
  failed: string[];
}

export const initialState: ProductsState = productAdapter.getInitialState({
  failed: [],
});

function addFailed(failed: string[], sku: string): string[] {
  return [...failed, sku].filter((val, idx, arr) => arr.indexOf(val) === idx);
}

function removeFailed(failed: string[], sku: string): string[] {
  return failed.filter(val => val !== sku);
}

export const productsReducer = createReducer(
  initialState,
  on(loadProductVariationsFail, loadProductFail, (state, action) => ({
    ...state,
    failed: addFailed(state.failed, action.payload.sku),
  })),
  on(loadProductSuccess, (state, action) => {
    const product = action.payload.product;
    const oldProduct = state.entities[product.sku] || { completenessLevel: 0 };

    const newProduct = { ...product };
    if (product.completenessLevel || (oldProduct && oldProduct.completenessLevel)) {
      newProduct.completenessLevel = Math.max(product.completenessLevel, oldProduct.completenessLevel);
    }

    return productAdapter.upsertOne(newProduct, {
      ...state,
      loading: false,
      failed: removeFailed(state.failed, product.sku),
    });
  }),
  on(loadProductVariationsSuccess, (state, action) =>
    productAdapter.updateOne(
      {
        id: action.payload.sku,
        changes: { variationSKUs: action.payload.variations, defaultVariationSKU: action.payload.defaultVariation },
      },
      { ...state, loading: false }
    )
  ),
  on(loadProductBundlesSuccess, (state, action) =>
    productAdapter.updateOne(
      { id: action.payload.sku, changes: { bundledProducts: action.payload.bundledProducts } },
      { ...state, loading: false }
    )
  ),
  on(loadRetailSetSuccess, (state, action) =>
    productAdapter.updateOne({ id: action.payload.sku, changes: { partSKUs: action.payload.parts } }, state)
  ),
  on(loadProductLinksSuccess, (state, action) =>
    productAdapter.updateOne(
      { id: action.payload.sku, changes: { links: action.payload.links } },
      { ...state, loading: false }
    )
  )
);
