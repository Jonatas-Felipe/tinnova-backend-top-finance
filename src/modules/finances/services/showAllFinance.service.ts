import { Inject, Injectable } from '@nestjs/common';
import type IFinanceRepository from '../repositories/IFinanceRepository';
import Finance from '../infra/knex/models/finance.model';

@Injectable()
class ShowAllFinanceService {
  constructor(
    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute(): Promise<Finance[]> {
    const finances = await this.financeRepository.findAll();

    return finances;
  }
}

export default ShowAllFinanceService;
