export default interface Finance {
  id: string;
  user_id: string;
  valor: number;
  descricao: string;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
