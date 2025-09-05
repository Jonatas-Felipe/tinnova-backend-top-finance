/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

import UpdateFinanceService from './updateFinance.service';
import type IFinanceRepository from '../repositories/IFinanceRepository';
import type IUpdateFinanceDTO from '../dtos/IUpdateFinanceDTO';
import type Finance from '../infra/knex/models/finance.model';
import type IUserResponseDTO from '../dtos/IUserReponseDTO';

describe('UpdateFinanceService', () => {
  let service: UpdateFinanceService;
  let financeRepository: IFinanceRepository;
  let usersClient: ClientProxy;

  const mockUser: IUserResponseDTO = {
    id: 'user-id-123',
    nome: 'Usuário de Teste',
    email: 'user@test.com',
    status: 'ativo',
    is_deleted: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    deleted_at: '',
  };

  const mockExistingFinance: Finance = {
    id: 'finance-id-456',
    user_id: 'old-user-id',
    descricao: 'Descrição Antiga',
    valor: 100,
    is_deleted: false,
  };

  const mockUpdateRequest: IUpdateFinanceDTO = {
    finance_id: 'finance-id-456',
    user_id: 'user-id-123',
    descricao: 'Descrição Atualizada',
    valor: 250.5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateFinanceService,
        {
          provide: 'FinanceRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
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

    service = module.get<UpdateFinanceService>(UpdateFinanceService);
    financeRepository = module.get<IFinanceRepository>('FinanceRepository');
    usersClient = module.get<ClientProxy>('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve atualizar e retornar um registro financeiro com sucesso', async () => {
      const expectedFinanceUpdate = {
        ...mockExistingFinance,
        user_id: mockUpdateRequest.user_id,
        valor: mockUpdateRequest.valor,
        descricao: mockUpdateRequest.descricao,
        user: mockUser,
      };

      jest.spyOn(usersClient, 'send').mockReturnValue(of(mockUser));
      jest
        .spyOn(financeRepository, 'findById')
        .mockResolvedValue(mockExistingFinance);
      jest
        .spyOn(financeRepository, 'save')
        .mockResolvedValue(expectedFinanceUpdate);

      const result = await service.execute(mockUpdateRequest);

      expect(usersClient.send).toHaveBeenCalledWith(
        { cmd: 'users_find' },
        { user_id: mockUpdateRequest.user_id },
      );
      expect(financeRepository.findById).toHaveBeenCalledWith(
        mockUpdateRequest.finance_id,
      );
      expect(financeRepository.save).toHaveBeenCalledWith(
        expectedFinanceUpdate,
      );
      expect(result).toEqual({ ...expectedFinanceUpdate, user: mockUser });
    });

    it('deve lançar RpcException se o usuário não for encontrado', async () => {
      jest.spyOn(usersClient, 'send').mockReturnValue(of(null));

      await expect(service.execute(mockUpdateRequest)).rejects.toThrow(
        new RpcException(`User with id ${mockUpdateRequest.user_id} not found`),
      );

      expect(financeRepository.findById).not.toHaveBeenCalled();
      expect(financeRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar RpcException se o serviço de usuários falhar', async () => {
      jest
        .spyOn(usersClient, 'send')
        .mockReturnValue(throwError(() => new Error()));

      await expect(service.execute(mockUpdateRequest)).rejects.toThrow(
        new RpcException(`User with id ${mockUpdateRequest.user_id} not found`),
      );

      expect(financeRepository.findById).not.toHaveBeenCalled();
    });

    it('deve lançar RpcException se o registro financeiro não for encontrado', async () => {
      jest.spyOn(usersClient, 'send').mockReturnValue(of(mockUser));
      jest.spyOn(financeRepository, 'findById').mockResolvedValue(undefined);

      await expect(service.execute(mockUpdateRequest)).rejects.toThrow(
        new RpcException('Finance not found'),
      );

      expect(financeRepository.save).not.toHaveBeenCalled();
    });
  });
});
