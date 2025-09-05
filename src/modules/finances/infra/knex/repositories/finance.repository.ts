import { Knex } from 'knex';

import knex from '../../../../../shared/infra/knex';
import Finance from '../models/finance.model';
import ICreateFinanceDTO from '../../../dtos/ICreateFinanceDTO';
import IFinanceRepository from '../../../repositories/IFinanceRepository';
import { IPagination } from 'src/@types/interfaces';

class FinancesRepository implements IFinanceRepository {
  private knex: Knex;

  constructor() {
    this.knex = knex;
  }

  public async findAll(
    page: number | undefined,
  ): Promise<Finance[] | IPagination<Finance>> {
    let finances = this.knex<Finance>('finances').where({ is_deleted: false });

    if (page) {
      const totalData = (await this.knex<Finance>('finances')
        .where({ is_deleted: false })
        .count('*')
        .first()) as unknown as { count: string };

      const total = parseInt(totalData.count, 10);

      let from = 0;
      let to = 0;

      const skipCount = (page - 1) * 8;
      from = (page - 1) * 8 + 1;
      to = Math.min(from + 8 - 1, total);
      finances = finances.offset(skipCount).limit(8);

      const financesData: IPagination<Finance> = {
        data: await finances.select('*'),
        from,
        to,
        total,
        pages: Math.ceil(total / 8),
      };

      return financesData;
    }

    return finances.select('*');
  }

  public async findById(id: string): Promise<Finance | undefined> {
    return this.knex<Finance>('finances')
      .where({ id, is_deleted: false })
      .first();
  }

  public async create(data: ICreateFinanceDTO): Promise<Finance> {
    const [finance] = await this.knex<Finance>('finances')
      .insert(data)
      .returning('*');

    return finance;
  }

  public async save(finance: Finance): Promise<Finance> {
    const [updated] = await this.knex<Finance>('finances')
      .where({ id: finance.id })
      .update({ ...finance, updated_at: this.knex.fn.now() })
      .returning('*');

    return updated;
  }

  public async delete(id: string): Promise<void> {
    await this.knex<Finance>('finances').where({ id }).update({
      deleted_at: this.knex.fn.now(),
      is_deleted: true,
    });
  }
}

export default FinancesRepository;
