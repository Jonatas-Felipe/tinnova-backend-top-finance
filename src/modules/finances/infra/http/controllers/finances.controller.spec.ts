/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

import FinancesController from './finances.controller';
import ShowAllFinancesService from '../../../services/showAllFinance.service';
import CreateFinanceService from '../../../services/createFinance.service';
import ShowFinanceByIdService from '../../../services/showFinanceById.service';
import UpdateFinanceService from '../../../services/updateFinance.service';
import DeleteFinanceService from '../../../services/deleteFinance.service';
import ICreateFinanceDTO from '../../../dtos/ICreateFinanceDTO';
import IUpdateFinanceDTO from '../../../dtos/IUpdateFinanceDTO';
import Finance from '../../knex/models/finance.model';

describe('FinancesController', () => {
  let controller: FinancesController;
  let showAllFinancesService: ShowAllFinancesService;
  let createFinanceService: CreateFinanceService;
  let showFinanceByIdService: ShowFinanceByIdService;
  let updateFinanceService: UpdateFinanceService;
  let deleteFinanceService: DeleteFinanceService;

  const mockFinance: Finance = {
    id: '1',
    user_id: 'user-1',
    valor: 150.5,
    descricao: 'Conta de luz',
    is_deleted: false,
    created_at: new Date('2025-09-05T10:00:00.000Z'),
    updated_at: new Date('2025-09-05T10:00:00.000Z'),
  };

  const mockCreateFinanceDto: ICreateFinanceDTO = {
    user_id: 'user-1',
    valor: 150.5,
    descricao: 'Conta de luz',
  };

  const mockUpdateFinanceDto: IUpdateFinanceDTO = {
    finance_id: '1',
    user_id: 'user-2',
    valor: 200,
    descricao: 'Conta de água',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancesController],
      providers: [
        {
          provide: ShowAllFinancesService,
          useValue: {
            execute: jest.fn().mockResolvedValue([mockFinance]),
          },
        },
        {
          provide: CreateFinanceService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockFinance),
          },
        },
        {
          provide: ShowFinanceByIdService,
          useValue: {
            execute: jest.fn().mockImplementation(({ finance_id }) => {
              if (finance_id === '1') {
                return Promise.resolve(mockFinance);
              }
              throw new Error('Finance not found');
            }),
          },
        },
        {
          provide: UpdateFinanceService,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              ...mockFinance,
              ...mockUpdateFinanceDto,
            }),
          },
        },
        {
          provide: DeleteFinanceService,
          useValue: {
            execute: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<FinancesController>(FinancesController);
    showAllFinancesService = module.get<ShowAllFinancesService>(
      ShowAllFinancesService,
    );
    createFinanceService =
      module.get<CreateFinanceService>(CreateFinanceService);
    showFinanceByIdService = module.get<ShowFinanceByIdService>(
      ShowFinanceByIdService,
    );
    updateFinanceService =
      module.get<UpdateFinanceService>(UpdateFinanceService);
    deleteFinanceService =
      module.get<DeleteFinanceService>(DeleteFinanceService);
  });

  describe('index', () => {
    it('Deve retornar uma lista de finanças', async () => {
      const payload = { page: 1 };
      const result = await controller.index(payload);

      expect(showAllFinancesService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockFinance]);
    });
  });

  describe('create', () => {
    it('Deve criar uma nova finança', async () => {
      const result = await controller.create(mockCreateFinanceDto);

      expect(createFinanceService.execute).toHaveBeenCalledWith(
        mockCreateFinanceDto,
      );
      expect(result).toEqual(mockFinance);
    });
  });

  describe('show', () => {
    it('Deve exibir uma finança', async () => {
      const payload = { finance_id: '1' };
      const result = await controller.show(payload);

      expect(showFinanceByIdService.execute).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockFinance);
    });

    it('Deve retornar um erro se a finança não for encontrada', async () => {
      const payload = { finance_id: '999' };
      await expect(controller.show(payload)).rejects.toThrow(
        'Finance not found',
      );
      expect(showFinanceByIdService.execute).toHaveBeenCalledWith(payload);
    });
  });

  describe('update', () => {
    it('Deve atualizar uma finança', async () => {
      const result = await controller.update(mockUpdateFinanceDto);

      expect(updateFinanceService.execute).toHaveBeenCalledWith(
        mockUpdateFinanceDto,
      );
      expect(result).toMatchObject({
        id: '1',
        user_id: 'user-2',
        valor: 200,
        descricao: 'Conta de água',
      });
    });
  });

  describe('delete', () => {
    it('Deve deletar uma finança', async () => {
      const payload = { finance_id: '1' };
      const result = await controller.delete(payload);

      expect(deleteFinanceService.execute).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ success: true });
    });
  });
});
