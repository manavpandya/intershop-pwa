import { createAction, props } from '@ngrx/store';

import { BreadcrumbItem } from 'ish-core/models/breadcrumb-item/breadcrumb-item.interface';
export const setBreadcrumbData = createAction(
  '[Viewconf Internal] Set Breadcrumb Data',
  props<{ payload: { breadcrumbData: BreadcrumbItem[] } }>()
);

export const setStickyHeader = createAction(
  '[Viewconf Internal] Set Sticky Header',
  props<{ payload: { sticky: boolean } }>()
);
