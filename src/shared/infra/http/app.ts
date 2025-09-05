import { Module } from '@nestjs/common';

import FinancesModule from '../../../modules/finances/finances.module';

@Module({
  imports: [FinancesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
