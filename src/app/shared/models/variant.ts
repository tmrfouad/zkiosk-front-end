import { VariantValue } from './variant-value';

export interface Variant {
    id?: number;
    productId?: number;
    valuesId?: string;
    price?: number;
    sku?: string;
    barcode?: string;
    values?: VariantValue[];
    active?: boolean;
}
