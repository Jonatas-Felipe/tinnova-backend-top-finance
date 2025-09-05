import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import type IFinanceRepository from '../repositories/IFinanceRepository';
import Finance from '../infra/knex/models/finance.model';

interface IRequest {
  finance_id: string;
}

@Injectable()
class showFinanceByIdService {
  constructor(
    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute({ finance_id }: IRequest): Promise<Finance> {
    const finance = await this.financeRepository.findById(finance_id);

    if (!finance) {
      throw new RpcException('Finance not found');
    }

    return finance;
  }
}

export default showFinanceByIdService;
