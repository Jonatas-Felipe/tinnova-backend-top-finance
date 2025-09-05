/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import type IFinanceRepository from '../repositories/IFinanceRepository';
import IRequest from '../dtos/IUpdateFinanceDTO';
import Finance from '../infra/knex/models/finance.model';
import IUserResponseDTO from '../dtos/IUserReponseDTO';

@Injectable()
class UpdateFinanceService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,

    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute({
    finance_id,
    user_id,
    valor,
    descricao,
  }: IRequest): Promise<Finance> {
    let user: IUserResponseDTO | null;
    try {
      user = await lastValueFrom<IUserResponseDTO | null>(
        this.usersClient.send({ cmd: 'users_find' }, { user_id }),
      );
    } catch (error) {
      throw new RpcException(`User with id ${user_id} not found`);
    }

    if (!user) {
      throw new RpcException(`User with id ${user_id} not found`);
    }

    const finance = await this.financeRepository.findById(finance_id);

    if (!finance) {
      throw new RpcException('Finance not found');
    }

    finance.user_id = user_id;
    finance.valor = valor;
    finance.descricao = descricao;

    await this.financeRepository.save(finance);

    return finance;
  }
}

export default UpdateFinanceService;
