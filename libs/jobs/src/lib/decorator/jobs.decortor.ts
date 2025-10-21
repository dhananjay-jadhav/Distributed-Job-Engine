import { JobsMetaData } from '@jobber/common-utils';
import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

export const JOBS_METADATA_KEY = 'JOBS-META';

export const Jobs = (metaData: JobsMetaData): ClassDecorator =>
  applyDecorators(SetMetadata(JOBS_METADATA_KEY, metaData), Injectable());
