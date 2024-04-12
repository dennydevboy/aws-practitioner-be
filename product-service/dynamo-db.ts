export default {
    productsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
            TableName: "${self:custom.dynamoDb.productsTableName}",
            AttributeDefinitions: [{
                AttributeName: "id",
                AttributeType: "S"
            }],
            KeySchema: [{
                AttributeName: "id",
                KeyType: "HASH"
            }
            ],
            BillingMode: "PAY_PER_REQUEST"
        }
    },
    stockTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
            TableName: "${self:custom.dynamoDb.stockTableName}",
            AttributeDefinitions: [{
                AttributeName: "product_id",
                AttributeType: "S"
            }],
            KeySchema: [{
                AttributeName: "product_id",
                KeyType: "HASH"
            }
            ],
            BillingMode: "PAY_PER_REQUEST"
        }
    }
}
