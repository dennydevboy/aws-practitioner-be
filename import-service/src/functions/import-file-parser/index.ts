import { handlerPath } from '../../libs/handler-resolver';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            s3: {
                bucket: '${self:custom.s3.bucketName}',
                event: "s3:ObjectCreated:*",
                rules: [
                    {
                        prefix: '${self:custom.s3.uploadFolder}',
                    },
                    {
                        suffix: '.cvs'
                    }
                ],
                existing: true,
                forceDeploy: true
            }
        }
    ]
}