export interface IPagination<T> {
  data: T[];
  from: number;
  to: number;
  total: number;
  pages: number;
}
