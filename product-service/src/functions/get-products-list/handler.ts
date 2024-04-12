import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductService } from '@libs/product-service';

const getProductList = async () => {
  try {
    const productService = new ProductService();
    const products = await productService.getProducts()
    return formatJSONResponse(products);
  } catch (e) {
    return formatJSONResponse({ message: "Failed to fetch products" }, 500);
  }
  
};

export const main = middyfy(getProductList);
