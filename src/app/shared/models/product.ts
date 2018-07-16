import { Option } from './option';
import { Variant } from './variant';

export interface Product {
    id?: number;
    title?: string;
    description?: string;
    price?: number;
    sku?: string;
    barcode?: string;
    imageId?: string;
    variants?: Variant[];
}
