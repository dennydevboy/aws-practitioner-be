import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductService } from '@libs/product-service';

const getProductList = async () => {
  const productService = new ProductService();
  const products = await productService.getProducts()
  return formatJSONResponse(products);
};

export const main = middyfy(getProductList);
