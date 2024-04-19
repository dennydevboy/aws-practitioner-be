import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { formatJSONResponse } from "../../libs/api-gateway";
import { S3Event } from "aws-lambda";
import neatCsv from 'neat-csv';

const s3Client = new S3Client({});

export const importFileParser = async (event: S3Event) => {
  try {
    console.log(`Event recived ${JSON.stringify(event)}`);

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const fileName = key.split('/').at(-1);
    const params = {
      Bucket: bucket,
      Key: key,
    };
    const item = await s3Client.send(new GetObjectCommand(params));
    const records = await neatCsv(item.Body);
    const copyParams = { Bucket: bucket, CopySource: `${bucket}/${key}`, Key: `${process.env.PARSED_FOLDER}/${fileName}` };

    records.forEach(record => console.log(record));

    console.log(`Copy ${JSON.stringify(copyParams)}`);
    await s3Client.send(new CopyObjectCommand(copyParams));

    const deleteParams = { Bucket: bucket, Key: key };
    console.log(`Delete ${JSON.stringify(deleteParams)}`);
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    return formatJSONResponse('Completed');
  } catch (err) {
    console.log(err);
    return formatJSONResponse({ message: 'File upload failed' }, 500);
  }
}