import csvParser from 'csv-parser';
import fs from 'fs';
import ChariotConsole from '../lib/ChariotConsole';
import WithBootedClient from '../lib/WithBootedClient';
import ConfigLoaderJob from '../jobs/ConfigLoaderJob';

const chariot = ChariotConsole({ label: 'slots-client' });

export class SlotsClient implements WithBootedClient {
  async boot() {}

  async getAll(): Promise<Array<ISlot>> {
    try {
      const csvPath = ConfigLoaderJob.getSlotsPath();
      const results: ISlot[] = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csvParser({ separator: ';' }))
          .on('data', (data) => results.push(data))
          .on('error', reject)
          .on('finish', resolve);
      });

      // Resolve Url or Src
      results.forEach((slot: ISlot) => {
        slot.image = ConfigLoaderJob.resolveUrl(slot.image);
      });

      return results;
    } catch (ex) {
      chariot.error(ex as any);
      throw ex;
    }
  }
}

export interface ISlot {
  id: string;
  name: string;
  image: string;
}

export default new SlotsClient();
