import { Knex } from 'knex';

import knex from '../../../../../shared/infra/knex';
import Finance from '../models/finance.model';
import ICreateFinanceDTO from '../../../dtos/ICreateFinanceDTO';
import IFinanceRepository from '../../../repositories/IFinanceRepository';

class FinancesRepository implements IFinanceRepository {
  private knex: Knex;

  constructor() {
    this.knex = knex;
  }

  public async findAll(): Promise<Finance[]> {
    const finances = this.knex<Finance>('finances')
      .where({ is_deleted: false })
      .select('*');

    return finances;
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
