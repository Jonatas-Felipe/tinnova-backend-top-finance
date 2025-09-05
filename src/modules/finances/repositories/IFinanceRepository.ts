import ICreateFinanceDTO from '../dtos/ICreateFinanceDTO';
import Finance from '../infra/knex/models/finance.model';

export default interface IFinanceRepository {
  findAll(): Promise<Finance[]>;
  findById(id: string): Promise<Finance | undefined>;
  create(data: ICreateFinanceDTO): Promise<Finance>;
  save(data: Finance): Promise<Finance>;
  delete(id: string): Promise<void>;
}
