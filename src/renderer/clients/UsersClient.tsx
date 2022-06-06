import csvParser from 'csv-parser';
import fs from 'fs';
import ChariotConsole from '../lib/ChariotConsole';
import WithBootedClient from '../lib/WithBootedClient';
import ConfigLoaderJob from '../jobs/ConfigLoaderJob';

const chariot = ChariotConsole({ label: 'users-client' });

export class UsersClient implements WithBootedClient {
  async boot() {}

  async getUsers(): Promise<Array<IUser>> {
    try {
      const csvPath = ConfigLoaderJob.getUsersFilePath();
      const results: IUser[] = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csvParser({ separator: ';' }))
          .on('data', (data) => results.push(data))
          .on('error', reject)
          .on('finish', resolve);
      });

      return results;
    } catch (ex) {
      chariot.error(ex as any);
      throw ex;
    }
  }
}

export interface IUser {
  id: string;
  name: string;
  image: string;
}

export default new UsersClient();
