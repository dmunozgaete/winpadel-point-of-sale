export default interface IListResponse<T> {
  offset: number;
  limit: number;
  total: number;
  items: T[];
}
