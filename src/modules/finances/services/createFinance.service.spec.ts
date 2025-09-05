/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

import CreateFinanceService from './createFinance.service';
import type IFinanceRepository from '../repositories/IFinanceRepository';
import type ICreateFinanceDTO from '../dtos/ICreateFinanceDTO';
import type IUserResponseDTO from '../dtos/IUserReponseDTO';
import type Finance from '../infra/knex/models/finance.model';

describe('CreateFinanceService', () => {
  let service: CreateFinanceService;
  let financeRepository: IFinanceRepository;
  let usersClient: ClientProxy;

  const mockUser: IUserResponseDTO = {
    id: 'user-123',
    nome: 'João da Silva',
    email: 'joao@example.com',
    status: 'ativo',
    is_deleted: false,
    created_at: '2025-09-05T12:00:00.000Z',
    updated_at: '2025-09-05T12:00:00.000Z',
    deleted_at: '',
  };

  const mockFinanceRequest: ICreateFinanceDTO = {
    user_id: 'user-123',
    descricao: 'Salário Mensal',
    valor: 5000,
  };

  const mockCreatedFinance: Finance = {
    id: 'finance-456',
    user_id: 'user-123',
    descricao: 'Salário Mensal',
    valor: 5000,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFinanceService,
        {
          provide: 'FinanceRepository',
          useValue: {
            create: jest.fn(),
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

    service = module.get<CreateFinanceService>(CreateFinanceService);
    financeRepository = module.get<IFinanceRepository>('FinanceRepository');
    usersClient = module.get<ClientProxy>('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('Deve criar e retornar um registro financeiro com sucesso', async () => {
      jest.spyOn(usersClient, 'send').mockReturnValue(of(mockUser));
      jest
        .spyOn(financeRepository, 'create')
        .mockResolvedValue(mockCreatedFinance);

      const result = await service.execute(mockFinanceRequest);

      expect(usersClient.send).toHaveBeenCalledWith(
        { cmd: 'users_find' },
        { user_id: mockFinanceRequest.user_id },
      );
      expect(financeRepository.create).toHaveBeenCalledWith(mockFinanceRequest);
      expect(result).toEqual({
        ...mockCreatedFinance,
        user: mockUser,
      });
    });

    it('Deve lançar uma RpcException se o usuário não for encontrado', async () => {
      jest.spyOn(usersClient, 'send').mockReturnValue(of(null));

      await expect(service.execute(mockFinanceRequest)).rejects.toThrow(
        new RpcException(
          `User with id ${mockFinanceRequest.user_id} not found`,
        ),
      );

      expect(financeRepository.create).not.toHaveBeenCalled();
    });

    it('Deve lançar uma RpcException se o serviço de usuários falhar', async () => {
      jest
        .spyOn(usersClient, 'send')
        .mockReturnValue(throwError(() => new Error('Service unavailable')));

      await expect(service.execute(mockFinanceRequest)).rejects.toThrow(
        new RpcException(
          `User with id ${mockFinanceRequest.user_id} not found`,
        ),
      );

      expect(financeRepository.create).not.toHaveBeenCalled();
    });
  });
});
