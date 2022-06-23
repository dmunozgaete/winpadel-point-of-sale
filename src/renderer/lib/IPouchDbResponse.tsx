export default interface IPouchDbResponse<TType> {
  data: PouchDB.Core.ExistingDocument<TType>[];
  offset: number;
  limit: number;
  total: number;
}
