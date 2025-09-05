export default interface IUserResponseDTO {
  id: string;
  nome: string;
  email: string;
  status: 'ativo' | 'inativo';
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
