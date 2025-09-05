import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import type IFinanceRepository from '../repositories/IFinanceRepository';

interface IRequest {
  finance_id: string;
}

@Injectable()
class deleteFinanceService {
  constructor(
    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute({ finance_id }: IRequest): Promise<void> {
    const finance = await this.financeRepository.findById(finance_id);

    if (!finance) {
      throw new RpcException('Finance not found');
    }

    return this.financeRepository.delete(finance_id);
  }
}

export default deleteFinanceService;
