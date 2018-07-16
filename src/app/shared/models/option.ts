import { OptionValue } from './option-value';

export interface Option {
    id?: number;
    name?: string;
    productId?: number;
    values?: OptionValue[];
}
