import type { AWS } from '@serverless/typescript';

import importProductsFile from './src/functions/import-products-file';
import importFileParser from './src/functions/import-file-parser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    profile: 'sls',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_NAME: '${self:custom.s3.bucketName}',
      UPLOAD_FOLDER: '${self:custom.s3.uploadFolder}',
      PARSED_FOLDER: '${self:custom.s3.parsedFolder}',
      SQS_QUEUE_NAME: '${self:custom.sqs.queueName}',
    },
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: [
        "s3:Get*",
        "s3:List*",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject"
      ],
      Resource: [
        'arn:aws:s3:::${self:custom.s3.bucketName}/${self:custom.s3.uploadFolder}/*',
        'arn:aws:s3:::${self:custom.s3.bucketName}/${self:custom.s3.parsedFolder}/*'
      ]
    }, {
      Effect: 'Allow',
      Action: [
        'sqs:SendMessage'
      ],
      Resource: ['arn:aws:sqs:${self:provider.region}:${aws:accountId}:${self:custom.sqs.queueName}']
    }],
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
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
    s3: {
      bucketName: 'ez-store-assets',
      uploadFolder: 'uploaded-products',
      parsedFolder: 'parsed'
    },
    sqs: {
      queueName: 'catalogItemsQueue'
    },
    authorizer: 'authorization-dev-basicAuthorizer'
  },
  resources: {
    Resources: {
      GatewayResponse: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: 'ACCESS_DENIED',
          RestApiId: { Ref: "ApiGatewayRestApi" }
        },
      },

    }
  }
};

module.exports = serverlessConfiguration;
