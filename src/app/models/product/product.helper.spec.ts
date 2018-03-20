import * as using from 'jasmine-data-provider';
import { ProductMapper } from './product.mapper';
import { Product, ProductHelper } from './product.model';

describe('Product Helper', () => {

  describe('image', () => {

    let product: Product;
    beforeEach(() => {
      product = { sku: 'sku' } as Product;
      product.images = [
        {
          'name': 'front S',
          'type': 'Image',
          'imageActualHeight': 110,
          'imageActualWidth': 110,
          'viewID': 'front',
          'effectiveUrl': '/assets/product_img/a.jpg',
          'typeID': 'S',
          'primaryImage': true
        },
        {
          'name': 'front S',
          'type': 'Image',
          'imageActualHeight': 110,
          'imageActualWidth': 110,
          'viewID': 'front',
          'effectiveUrl': '/assets/product_img/a.jpg',
          'typeID': 'S',
          'primaryImage': false
        },
        {
          'name': 'front L',
          'type': 'Image',
          'imageActualHeight': 500,
          'imageActualWidth': 500,
          'viewID': 'front',
          'effectiveUrl': '/assets/product_img/a.jpg',
          'typeID': 'L',
          'primaryImage': true
        },
        {
          'name': 'side L',
          'type': 'Image',
          'imageActualHeight': 500,
          'imageActualWidth': 500,
          'viewID': 'side',
          'effectiveUrl': '/assets/product_img/b.jpg',
          'typeID': 'L',
          'primaryImage': false
        }

      ];
    });

    describe('getPrimaryImage()', () => {

      it('should return primary image when called with image type as L(Large size)', () => {
        expect(ProductHelper.getPrimaryImage(product, 'L').primaryImage).toBeTruthy();
      });

      it('should return no image when called with invalid image type', () => {
        expect(ProductHelper.getPrimaryImage(product, 'W')).toBeUndefined();
      });

      it('should return no image when images is not available', () => {
        product.images = [];
        expect(ProductHelper.getPrimaryImage(product, 'L')).toBeUndefined();
      });

    });

    describe('getImageViewIDsExcludePrimary()', () => {

      it('should return list of image viewIDs  excluding primary image viewID when called with image type as L(Large size)', () => {
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'L').length).toBeGreaterThan(0);
      });

      it('should return empty list when called with invalid image type', () => {
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'W').length).toEqual(0);
      });

      it('should return empty list when images is not available', () => {
        product.images = [];
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'L').length).toEqual(0);
      });

    });

    describe('getImageByImageTypeAndImageView()', () => {

      it('should return image when called with image type as L(Large size) and image view as front', () => {
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'L', 'front')).toEqual(product.images[2]);
      });

      it('should return no image when called with invalid image type and invalid image view', () => {
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'W', 'left')).toBeUndefined();
      });

      it('should return no image when images is not available', () => {
        product.images = [];
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'L', 'front')).toBeUndefined();
      });

    });
  });

  describe('isMasterProduct()', () => {

    function dataProvider() {
      return [
        { product: {}, expected: false },
        { product: { mastered: true }, expected: false },
        { product: { productMaster: true }, expected: true },
      ];
    }

    using(dataProvider, (dataSlice) => {
      it(`should return ${dataSlice.expected} when supplying product '${JSON.stringify(dataSlice.product)}'`, () => {
        const product = ProductMapper.fromData(dataSlice.product);
        expect(ProductHelper.isMasterProduct(product)).toEqual(dataSlice.expected);
      });
    });
  });

});
