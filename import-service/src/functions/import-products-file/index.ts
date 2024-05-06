import { handlerPath } from '../../libs/handler-resolver';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: 'import-service',
                cors: true,
                request: {
                    parameters: {
                        querystrings: {
                            name: true
                        }
                    }
                },
                authorizer: {
                    type: 'token',
                    arn: 'arn:aws:lambda:${self:provider.region}:${aws:accountId}:function:${self:custom.authorizer}',
                    resultTtlInSeconds: 0
                  }
            },
        },
    ],
};
