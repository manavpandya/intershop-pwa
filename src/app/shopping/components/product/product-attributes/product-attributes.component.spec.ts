import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Attribute, StringValue } from '../../../../models/attribute/attribute.model';
import { Product } from '../../../../models/product/product.model';
import { ProductAttributesComponent } from './product-attributes.component';

describe('Product Attributes Component', () => {
  let component: ProductAttributesComponent;
  let fixture: ComponentFixture<ProductAttributesComponent>;
  let element: HTMLElement;
  let product: Product;
  beforeEach(async(() => {
    product = new Product('sku');
    product.attributes = [
      new Attribute('A', new StringValue('A')),
      new Attribute('B', new StringValue('B'))
    ];
    TestBed.configureTestingModule({
      declarations: [ProductAttributesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAttributesComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.product = product;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render product attributes when available', () => {
    fixture.detectChanges();
    expect(element.getElementsByTagName('dt').length).toEqual(2);
    expect(element.getElementsByClassName('ish-ca-type').length).toEqual(2);
    expect(element.getElementsByClassName('ish-ca-value').length).toEqual(2);
  });

  it('should render product attributes name and value when available', () => {
    product.attributes = [new Attribute('A', new StringValue('A'))];
    fixture.detectChanges();
    expect(element.querySelector('.ish-ca-type').textContent).toEqual('A:');
    expect(element.querySelector('.ish-ca-value').textContent).toEqual('A');
  });
});