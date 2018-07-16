import { OptionValue } from './option-value';

export interface VariantValue {
    id?: number;
    optionId?: number;
    valueId?: number;
    variantId?: number;
    value?: OptionValue;
}
