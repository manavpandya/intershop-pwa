import { Attribute } from '../attribute/attribute.model';
import { Image } from '../image/image.model';
import { PriceData } from '../price/price.interface';
import { WarrantyData } from '../warranty/warranty.interface';

export interface ProductData {

  sku: string;
  productName: string;
  shortDescription: string;
  longDescription: string;

  availability: boolean;
  averageRating: string;
  roundedAverageRating: string;

  images: Image[];

  availableWarranties?: WarrantyData[];
  availableGiftWraps?: any[];
  availableGiftMessages?: any[];
  bundles: any[];
  retailSet: boolean;

  inStock: boolean;

  // If warranty {
  price?: PriceData;
  currency?: any;
  // }

  productMasterSKU?: string;
  minOrderQuantity: number;
  // If Variation Master and Retail Set {
  minListPrice?: number;
  maxListPrice?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
  // }
  variationAttributeValues?: Attribute[];
  variableVariationAttributes?: Attribute[];
  partOfRetailSet: boolean;
  // If  Retail Set {
  summedUpListPrice?: number;
  summedUpSalePrice?: number;
  // }

  attachments?: any;
  variations?: any;
  crosssells?: any;
  productMaster: boolean;
  listPrice: PriceData;
  productBundle: boolean;
  salePrice: PriceData;
  manufacturer: string;
  mastered: boolean;
  readyForShipmentMin: number;
  readyForShipmentMax: number;
  attributes?: Attribute[];
}
