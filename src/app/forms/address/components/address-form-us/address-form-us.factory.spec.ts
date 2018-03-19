import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { AddressFormUSFactory } from './address-form-us.factory';

describe('AddressFormDEFactory', () => {
  let addressFactory: AddressFormUSFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        AddressFormUSFactory
      ]
    });
    addressFactory = TestBed.get(AddressFormUSFactory);
  });

  it('should be created', () => {
    expect(addressFactory).toBeTruthy();
  });

  describe('group', () => {
    it('should return a default form group if called', () => {
      const fg = addressFactory.group();
      expect(fg.get('firstName')).toBeTruthy('form group contains firstname');
      expect(fg.get('lastName')).toBeTruthy('form group contains lastName');
      expect(fg.get('addressLine1')).toBeTruthy('form group contains addressLine1');
      expect(fg.get('addressLine2')).toBeTruthy('form group contains addressLine2');
      expect(fg.get('postalCode')).toBeTruthy('form group contains postalCode');
      expect(fg.get('city')).toBeTruthy('form group contains city');
      expect(fg.get('state')).toBeTruthy('form group contains state');
      expect(fg.get('phoneHome')).toBeTruthy('form group contains phoneHome');
    });
  });
});