/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

import ShowAllFinanceService from './showAllFinance.service';
import type IFinanceRepository from '../repositories/IFinanceRepository';
import type Finance from '../infra/knex/models/finance.model';
import type IUserResponseDTO from '../dtos/IUserReponseDTO';
import type { IPagination } from 'src/@types/interfaces';

describe('ShowAllFinanceService', () => {
  let service: ShowAllFinanceService;
  let financeRepository: IFinanceRepository;
  let usersClient: ClientProxy;

  const mockUser1: IUserResponseDTO = {
    id: 'user-1',
    nome: 'Alice',
    email: 'alice@example.com',
    status: 'ativo',
    is_deleted: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    deleted_at: '',
  };

  const mockFinance1: Finance = {
    id: 'finance-1',
    user_id: 'user-1',
    descricao: 'Compra Online',
    valor: 100,
    is_deleted: false,
  };

  const mockFinance2: Finance = {
    id: 'finance-2',
    user_id: 'user-2',
    descricao: 'Supermercado',
    valor: 250,
    is_deleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowAllFinanceService,
        {
          provide: 'FinanceRepository',
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: 'USERS_SERVICE',
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShowAllFinanceService>(ShowAllFinanceService);
    financeRepository = module.get<IFinanceRepository>('FinanceRepository');
    usersClient = module.get<ClientProxy>('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('quando a paginação é fornecida', () => {
      const mockPaginatedResult: IPagination<Finance> = {
        data: [mockFinance1, mockFinance2],
        total: 2,
        pages: 1,
        from: 1,
        to: 2,
      };

      it('deve retornar finanças paginadas com os dados dos usuários', async () => {
        jest
          .spyOn(financeRepository, 'findAll')
          .mockResolvedValue(mockPaginatedResult);
        jest.spyOn(usersClient, 'send').mockReturnValue(of(mockUser1));

        const result = (await service.execute(1)) as IPagination<Finance>;

        expect(financeRepository.findAll).toHaveBeenCalledWith(1);
        expect(usersClient.send).toHaveBeenCalledTimes(2);
        expect(usersClient.send).toHaveBeenCalledWith(
          { cmd: 'users_find' },
          { user_id: mockFinance1.user_id },
        );
        expect(result.data[0].user).toEqual(mockUser1);
        expect(result.data[1].user).toEqual(mockUser1);
      });

      it('deve atribuir undefined ao usuário se o serviço de usuários falhar', async () => {
        jest
          .spyOn(financeRepository, 'findAll')
          .mockResolvedValue(mockPaginatedResult);
        jest
          .spyOn(usersClient, 'send')
          .mockReturnValueOnce(of(mockUser1))
          .mockReturnValueOnce(
            throwError(() => new Error('Service Unavailable')),
          );

        const result = (await service.execute(1)) as IPagination<Finance>;

        expect(financeRepository.findAll).toHaveBeenCalledWith(1);
        expect(usersClient.send).toHaveBeenCalledTimes(2);
        expect(result.data[0].user).toEqual(mockUser1);
        expect(result.data[1].user).toBeUndefined();
      });
    });

    describe('quando a paginação não é fornecida', () => {
      const mockFinanceArray: Finance[] = [mockFinance1, mockFinance2];

      it('deve retornar um array de finanças com os dados dos usuários', async () => {
        jest
          .spyOn(financeRepository, 'findAll')
          .mockResolvedValue(mockFinanceArray);
        jest
          .spyOn(usersClient, 'send')
          .mockImplementation((cmd, payload: any) => {
            if (payload.user_id === 'user-1') {
              return of(mockUser1);
            }
            return of(null);
          });

        const result = (await service.execute(undefined)) as Finance[];

        expect(financeRepository.findAll).toHaveBeenCalledWith(undefined);
        expect(usersClient.send).toHaveBeenCalledTimes(2);
        expect(result[0].user).toEqual(mockUser1);
        expect(result[1].user).toBeUndefined();
      });

      it('deve retornar um array vazio se nenhuma finança for encontrada', async () => {
        jest.spyOn(financeRepository, 'findAll').mockResolvedValue([]);

        const result = (await service.execute(undefined)) as Finance[];

        expect(financeRepository.findAll).toHaveBeenCalledWith(undefined);
        expect(usersClient.send).not.toHaveBeenCalled();
        expect(result).toEqual([]);
      });
    });
  });
});
