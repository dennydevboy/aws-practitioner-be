import { middyfy } from '../../libs/lambda';
import { importProductsFile } from './import-products-file';

export const main = middyfy(importProductsFile);
