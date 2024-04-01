import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductService } from '@libs/product-service';

const getProductList = async (event) => {
  const productService = new ProductService();
  const product = await productService.getProductById(event.pathParameters?.productId)
  return product ? formatJSONResponse(product) : formatJSONResponse({ level: 'Error', message: 'Product not found' });
};

export const main = middyfy(getProductList);
