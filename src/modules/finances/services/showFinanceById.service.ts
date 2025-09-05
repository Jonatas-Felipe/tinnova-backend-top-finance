/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import type IFinanceRepository from '../repositories/IFinanceRepository';
import Finance from '../infra/knex/models/finance.model';
import IUserResponseDTO from '../dtos/IUserReponseDTO';

interface IRequest {
  finance_id: string;
}

@Injectable()
class showFinanceByIdService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,

    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute({ finance_id }: IRequest): Promise<Finance> {
    const finance = await this.financeRepository.findById(finance_id);

    if (!finance) {
      throw new RpcException('Finance not found');
    }

    let user: IUserResponseDTO | null;
    try {
      user = await lastValueFrom<IUserResponseDTO | null>(
        this.usersClient.send(
          { cmd: 'users_find' },
          { user_id: finance.user_id },
        ),
      );
    } catch (error) {
      user = null;
    }

    finance.user = user || undefined;

    return finance;
  }
}

export default showFinanceByIdService;
