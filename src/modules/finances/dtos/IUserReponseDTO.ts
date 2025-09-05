export default interface IUserResponseDTO {
  id: string;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo';
  is_deleted: boolean;
  created: string;
  updated: string;
  deleted: string;
}
