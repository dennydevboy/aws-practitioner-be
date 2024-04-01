import products from './product-mock'
import Product from './product.type'

export class ProductService {
    async getProducts(): Promise<Product[]> {
        return Promise.resolve(products)
    }

    async getProductById(productId: string): Promise<Product|null> {
        const product = products.find(product => product.id === productId)
        return Promise.resolve(product || null)
    }
}
