import { IsString, IsNumber } from 'class-validator';

export default class ICreateFinanceDTO {
  @IsString()
  user_id: string;

  @IsNumber()
  valor: number;

  @IsString()
  descricao: string;
}
