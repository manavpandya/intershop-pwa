import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  MessagesPayloadType,
  displayErrorMessage,
  displayInfoMessage,
  displaySuccessMessage,
  displayWarningMessage,
} from 'ish-core/store/core/messages';

// not-dead-code
@Injectable({ providedIn: 'root' })
export class MessageFacade {
  constructor(private store: Store) {}

  info(data: MessagesPayloadType) {
    this.store.dispatch(displayInfoMessage({ payload: data }));
  }

  error(data: MessagesPayloadType) {
    this.store.dispatch(displayErrorMessage({ payload: data }));
  }

  warn(data: MessagesPayloadType) {
    this.store.dispatch(displayWarningMessage({ payload: data }));
  }

  success(data: MessagesPayloadType) {
    this.store.dispatch(displaySuccessMessage({ payload: data }));
  }
}
