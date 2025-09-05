/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import type IFinanceRepository from '../repositories/IFinanceRepository';
import IRequest from '../dtos/ICreateFinanceDTO';
import Finance from '../infra/knex/models/finance.model';
import IUserResponseDTO from '../dtos/IUserReponseDTO';

@Injectable()
class CreateFinanceService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,

    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute(data: IRequest): Promise<Finance> {
    let user: IUserResponseDTO | null;
    try {
      user = await lastValueFrom<IUserResponseDTO | null>(
        this.usersClient.send({ cmd: 'users_find' }, { user_id: data.user_id }),
      );
    } catch (error) {
      throw new RpcException(`User with id ${data.user_id} not found`);
    }

    if (!user) {
      throw new RpcException(`User with id ${data.user_id} not found`);
    }

    const finance = await this.financeRepository.create({
      ...data,
    });

    return finance;
  }
}

export default CreateFinanceService;
