/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import type IFinanceRepository from '../repositories/IFinanceRepository';
import Finance from '../infra/knex/models/finance.model';
import IUserResponseDTO from '../dtos/IUserReponseDTO';
import { IPagination } from 'src/@types/interfaces';

@Injectable()
class ShowAllFinanceService {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,

    @Inject('FinanceRepository')
    private readonly financeRepository: IFinanceRepository,
  ) {}

  async execute(
    page: number | undefined,
  ): Promise<Finance[] | IPagination<Finance>> {
    const finances = await this.financeRepository.findAll(page);

    let index = 0;
    if (page) {
      const newFinances = finances as IPagination<Finance>;
      for (const finance of newFinances.data) {
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

        newFinances.data[index].user = user || undefined;
        index += 1;
      }
      return newFinances;
    } else {
      const newFinances = finances as Finance[];
      for (const finance of newFinances) {
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

        newFinances[index].user = user || undefined;
        index += 1;
      }

      return newFinances;
    }
  }
}

export default ShowAllFinanceService;
