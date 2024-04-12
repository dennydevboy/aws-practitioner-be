import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, ScanCommand, TransactWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Product } from './product.type';
import { CreateProduct } from './create-product.type';
import { randomUUID } from 'crypto';
import { omit } from 'lodash';

const mergeProductArrays = (products = [], stock = []) =>
    products.map(product => ({
        ...omit(stock.find((item) => (item.product_id === product.id) && item), 'product_id'),
        ...product
    }));

export class ProductService {
    private client: DynamoDBClient;
    private documentClient: DynamoDBDocumentClient;

    constructor() {
        this.client = new DynamoDBClient;
        this.documentClient = DynamoDBDocumentClient.from(this.client);
    };

    async getProducts(): Promise<Product[]> {
        const productCommand = new ScanCommand({
            TableName: process.env.PRODUCTS_TABLE,
        });

        const stockCommand = new ScanCommand({
            TableName: process.env.STOCK_TABLE,
        });

        const [productResponse, stockResponse] = await Promise.all([
            this.documentClient.send(productCommand),
            this.documentClient.send(stockCommand)
        ]);

        return Promise.resolve(mergeProductArrays(productResponse.Items, stockResponse.Items));
    };

    async getProductById(productId: string): Promise<Product | null> {
        const productCommand = new QueryCommand({
            TableName: process.env.PRODUCTS_TABLE,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': productId
            }
        });

        const stockCommand = new QueryCommand({
            TableName: process.env.STOCK_TABLE,
            KeyConditionExpression: 'product_id = :product_id',
            ExpressionAttributeValues: {
                ':product_id': productId
            }
        });

        const [productResponse, stockResponse] = await Promise.all([
            this.documentClient.send(productCommand),
            this.documentClient.send(stockCommand)
        ]);

        const products = mergeProductArrays(mergeProductArrays(productResponse.Items, stockResponse.Items));

        return Promise.resolve(products.length ? products[0] as Product : null);
    };

    async saveProduct(product: CreateProduct): Promise<Product> {
        const id = randomUUID();
        const writeCommand = new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: process.env.PRODUCTS_TABLE,
                        Item: {
                            id: id,
                            title: product.title,
                            description: product.description,
                            price: product.price
                        }
                    }
                },
                {
                    Put: {
                        TableName: process.env.STOCK_TABLE,
                        Item: {
                            product_id: id,
                            count: product.count
                        }
                    }
                }
            ]
        });

        await this.documentClient.send(writeCommand);
        return { id: id, ...product };
    }
}
