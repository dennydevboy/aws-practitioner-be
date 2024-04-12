import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { ProductService } from '@libs/product-service';

const getProductList = async (event) => {
  try {
    const productService = new ProductService();
    const product = await productService.getProductById(event.pathParameters?.productId);
    return product ? formatJSONResponse(product) : formatJSONResponse({ message: "Product not found" }, 404)
  } catch (e) {
    return formatJSONResponse({ message: "Failed to fetch product by id" }, 500);
  }
};

export const main = middyfy(getProductList);
