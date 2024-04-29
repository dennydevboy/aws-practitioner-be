import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { ProductService } from "../../libs/product-service";
import { SQSEvent } from "aws-lambda";
import middy from '@middy/core';

const productService = new ProductService();
const snsClient = new SNSClient({});

export const catalogBatchProcess = async (event: SQSEvent) => {
    console.log(event);

    try {
        return Promise.all(event.Records?.map(async(record) => {
            const product = JSON.parse(record.body);
            
            console.log(`Product: ${record.body} is in process`);
            
            const createdProduct = await productService.saveProduct(product);
            
            const message = `Product: '${createdProduct.id} - ${createdProduct.title}' created`;
            
            const messageParams = {
                TopicArn: process.env.SNS_ARN,
                Message: message,
                Subject: 'Product Created',
            }

            console.log(message);

            await snsClient.send(new PublishCommand(messageParams));
        }));
    } catch (err) {
        console.log('Parse products error: ', err);

        return Promise.reject();
    }
}

export const main = middy(catalogBatchProcess);
