/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';

import deleteFinanceService from './deleteFinance.service';
import type IFinanceRepository from '../repositories/IFinanceRepository';
import type Finance from '../infra/knex/models/finance.model';

describe('deleteFinanceService', () => {
  let service: deleteFinanceService;
  let financeRepository: IFinanceRepository;

  const mockFinanceId = 'finance-id-123';

  const mockExistingFinance: Finance = {
    id: mockFinanceId,
    user_id: 'user-id-456',
    descricao: 'Conta de Luz',
    valor: 150.75,
    is_deleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        deleteFinanceService,
        {
          provide: 'FinanceRepository',
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<deleteFinanceService>(deleteFinanceService);
    financeRepository = module.get<IFinanceRepository>('FinanceRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve deletar um registro financeiro com sucesso', async () => {
      jest
        .spyOn(financeRepository, 'findById')
        .mockResolvedValue(mockExistingFinance);
      jest.spyOn(financeRepository, 'delete').mockResolvedValue(undefined);

      await service.execute({ finance_id: mockFinanceId });

      expect(financeRepository.findById).toHaveBeenCalledWith(mockFinanceId);
      expect(financeRepository.delete).toHaveBeenCalledWith(mockFinanceId);
    });

    it('deve lançar uma RpcException se o registro financeiro não for encontrado', async () => {
      jest.spyOn(financeRepository, 'findById').mockResolvedValue(undefined);

      await expect(
        service.execute({ finance_id: mockFinanceId }),
      ).rejects.toThrow(new RpcException('Finance not found'));

      expect(financeRepository.findById).toHaveBeenCalledWith(mockFinanceId);
      expect(financeRepository.delete).not.toHaveBeenCalled();
    });
  });
});
