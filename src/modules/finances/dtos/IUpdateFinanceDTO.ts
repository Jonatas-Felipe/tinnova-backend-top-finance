import { IsString, IsNumber } from 'class-validator';

export default class IUpdateFinanceDTO {
  @IsString()
  finance_id: string;

  @IsString()
  user_id: string;

  @IsNumber()
  valor: number;

  @IsString()
  descricao: string;
}
