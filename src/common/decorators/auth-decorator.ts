import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@src/constants';

export const SkipJwtAuth = () => SetMetadata(IS_PUBLIC_KEY, true);
