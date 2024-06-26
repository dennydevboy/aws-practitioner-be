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
            },
        },
    ],
};
