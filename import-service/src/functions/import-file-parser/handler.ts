import { importFileParser } from './import-file-parser';
import middy from '@middy/core';

export const main = middy(importFileParser);