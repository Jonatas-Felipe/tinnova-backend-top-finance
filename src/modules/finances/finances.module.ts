import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import FinancesController from './infra/http/controllers/finances.controller';
import FinanceRepository from './infra/knex/repositories/finance.repository';
import ShowAllFinancesService from './services/showAllFinance.service';
import CreateFinanceService from './services/createFinance.service';
import ShowFinanceByIdService from './services/showFinanceById.service';
import UpdateFinanceService from './services/updateFinance.service';
import DeleteFinanceService from './services/deleteFinance.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.TOP_USERS_HOST || 'localhost',
          port: parseInt(process.env.TOP_USERS_PORT || '3334', 10),
        },
      },
    ]),
  ],
  controllers: [FinancesController],
  providers: [
    ShowAllFinancesService,
    CreateFinanceService,
    ShowFinanceByIdService,
    UpdateFinanceService,
    DeleteFinanceService,
    {
      provide: 'FinanceRepository',
      useClass: FinanceRepository,
    },
  ],
})
class FinancesModule {}

export default FinancesModule;
