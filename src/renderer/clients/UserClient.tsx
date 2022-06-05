import WithBootedClient from '../lib/WithBootedClient';

class UserClient implements WithBootedClient {
  async boot() {}
}

export interface IUser {
  full_name: string;
  document_type: string;
  document_number: string;
  primarysid: string;
  email: string;
}

export default new UserClient();
