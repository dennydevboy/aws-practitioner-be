import type { AWS } from '@serverless/typescript';
import dynamoDb from './dynamo-db';
import createProduct from '@functions/create-product';
import getProductsList from '@functions/get-products-list';
import getProductById from '@functions/get-product-by-id';
import catalogBatchProcess from '@functions/catalog-batch-process';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE: '${self:custom.dynamoDb.productsTableName}',
      STOCK_TABLE: '${self:custom.dynamoDb.stockTableName}',
      CREATE_PRODUCT_TOPIC_ARN: {
        Ref: 'createProductTopic'
      },
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: [
        'dynamodb:DescribeTable',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem'
      ],
      Resource: [{"Fn::GetAtt": [ "productsTable", "Arn" ]}, {"Fn::GetAtt": [ "stockTable", "Arn" ]}]
    }, {
      Effect: 'Allow',
      Action: [
        'sns:*'
      ],
      Resource: {
        Ref: 'createProductTopic'
      }
    }, {
      Effect: 'Allow',
      Action: [
        'ssm:GetParameter'
      ],
      Resource: "arn:aws:ssm:${self:provider.region}:${aws:accountId}:parameter/product/*"
    }],
  },
  // import the function via paths
  functions: { getProductsList, getProductById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamoDb: {
      productsTableName: 'products',
      stockTableName: 'stock'
    },
  },
  resources: {
    Resources: {
      ...dynamoDb,
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic', 
        },
      },
      emailSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'dzianis_spartak@epam.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic',
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
