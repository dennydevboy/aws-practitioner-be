import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { formatJSONResponse } from "../../libs/api-gateway";

const s3Client = new S3Client({});

export const importProductsFile = async (event) => {
    try {
        console.log(`Received URL from ${event.queryStringParameters.name}`);

        const key = `${process.env.UPLOAD_FOLDER}/${event.queryStringParameters.name}`;
        const command = new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key });
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return formatJSONResponse(signedUrl);
    } catch (err) {
        console.log('Upload of the file failed', err);
        return formatJSONResponse({ message: 'Upload of the file failed' }, 500);
    }
}