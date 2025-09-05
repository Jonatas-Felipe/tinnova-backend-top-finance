/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

import showFinanceByIdService from './showFinanceById.service';
import type IFinanceRepository from '../repositories/IFinanceRepository';
import type Finance from '../infra/knex/models/finance.model';
import type IUserResponseDTO from '../dtos/IUserReponseDTO';

describe('showFinanceByIdService', () => {
  let service: showFinanceByIdService;
  let financeRepository: IFinanceRepository;
  let usersClient: ClientProxy;

  const mockFinanceId = 'finance-id-123';

  const mockUser: IUserResponseDTO = {
    id: 'user-id-456',
    nome: 'João da Silva',
    email: 'joao@example.com',
    status: 'ativo',
    is_deleted: false,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    deleted_at: '',
  };

  const mockFinance: Finance = {
    id: mockFinanceId,
    user_id: 'user-id-456',
    descricao: 'Pagamento de Fatura',
    valor: 1200,
    is_deleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        showFinanceByIdService,
        {
          provide: 'FinanceRepository',
          useValue: {
            findById: jest.fn(),
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

    service = module.get<showFinanceByIdService>(showFinanceByIdService);
    financeRepository = module.get<IFinanceRepository>('FinanceRepository');
    usersClient = module.get<ClientProxy>('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve retornar um registro financeiro com os dados do usuário', async () => {
      jest.spyOn(financeRepository, 'findById').mockResolvedValue(mockFinance);
      jest.spyOn(usersClient, 'send').mockReturnValue(of(mockUser));

      const result = await service.execute({ finance_id: mockFinanceId });

      expect(financeRepository.findById).toHaveBeenCalledWith(mockFinanceId);
      expect(usersClient.send).toHaveBeenCalledWith(
        { cmd: 'users_find' },
        { user_id: mockFinance.user_id },
      );
      expect(result).toEqual({ ...mockFinance, user: mockUser });
    });

    it('deve lançar RpcException se o registro financeiro não for encontrado', async () => {
      jest.spyOn(financeRepository, 'findById').mockResolvedValue(undefined);

      await expect(
        service.execute({ finance_id: mockFinanceId }),
      ).rejects.toThrow(new RpcException('Finance not found'));

      expect(financeRepository.findById).toHaveBeenCalledWith(mockFinanceId);
      expect(usersClient.send).not.toHaveBeenCalled();
    });

    it('deve retornar o registro financeiro com usuário indefinido se o usuário não for encontrado', async () => {
      jest.spyOn(financeRepository, 'findById').mockResolvedValue(mockFinance);
      jest.spyOn(usersClient, 'send').mockReturnValue(of(null));

      const result = await service.execute({ finance_id: mockFinanceId });

      expect(financeRepository.findById).toHaveBeenCalledWith(mockFinanceId);
      expect(usersClient.send).toHaveBeenCalledWith(
        { cmd: 'users_find' },
        { user_id: mockFinance.user_id },
      );
      expect(result).toEqual({ ...mockFinance, user: undefined });
    });

    it('deve retornar o registro financeiro com usuário indefinido se o serviço de usuários falhar', async () => {
      jest.spyOn(financeRepository, 'findById').mockResolvedValue(mockFinance);
      jest
        .spyOn(usersClient, 'send')
        .mockReturnValue(throwError(() => new Error('Service unavailable')));

      const result = await service.execute({ finance_id: mockFinanceId });

      expect(financeRepository.findById).toHaveBeenCalledWith(mockFinanceId);
      expect(usersClient.send).toHaveBeenCalledWith(
        { cmd: 'users_find' },
        { user_id: mockFinance.user_id },
      );
      expect(result).toEqual({ ...mockFinance, user: undefined });
    });
  });
});
