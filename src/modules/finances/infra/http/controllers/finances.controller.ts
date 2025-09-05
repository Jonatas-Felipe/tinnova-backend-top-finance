import { Controller } from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';

import ICreateFinanceDTO from '../../../dtos/ICreateFinanceDTO';
import IUpdateFinanceDTO from '../../../dtos/IUpdateFinanceDTO';

import ShowAllFinancesService from '../../../services/showAllFinance.service';
import CreateFinanceService from '../../../services/createFinance.service';
import ShowFinanceByIdService from '../../../services/showFinanceById.service';
import UpdateFinanceService from '../../../services/updateFinance.service';
import DeleteFinanceService from '../../../services/deleteFinance.service';

@Controller('finances')
class FinancesController {
  constructor(
    private readonly showAllFinancesService: ShowAllFinancesService,
    private readonly createFinanceService: CreateFinanceService,
    private readonly showFinanceByIdService: ShowFinanceByIdService,
    private readonly updateFinanceService: UpdateFinanceService,
    private readonly deleteFinanceService: DeleteFinanceService,
  ) {}

  @MessagePattern({ cmd: 'finances_find_all' })
  async index(@Payload() { page }: { page: number | undefined }) {
    const finances = await this.showAllFinancesService.execute(page);

    return finances;
  }

  @MessagePattern({ cmd: 'finances_create' })
  create(@Payload() body: ICreateFinanceDTO) {
    const { user_id, valor, descricao } = body;

    return this.createFinanceService.execute({
      user_id,
      valor,
      descricao,
    });
  }

  @MessagePattern({ cmd: 'finances_find' })
  async show(@Payload() { finance_id }: { finance_id: string }) {
    return this.showFinanceByIdService.execute({
      finance_id,
    });
  }

  @MessagePattern({ cmd: 'finances_update' })
  update(@Payload() data: IUpdateFinanceDTO) {
    const { finance_id, user_id, valor, descricao } = data;

    return this.updateFinanceService.execute({
      finance_id,
      user_id,
      valor,
      descricao,
    });
  }

  @MessagePattern({ cmd: 'finances_delete' })
  async delete(@Payload() { finance_id }: { finance_id: string }) {
    await this.deleteFinanceService.execute({
      finance_id,
    });

    return { success: true };
  }
}

export default FinancesController;
