import OrdersClient from 'renderer/clients/OrdersClient';
import ChariotConsole from '../lib/ChariotConsole';
import Job from '../lib/Job';

const chariot = ChariotConsole({ label: 'databases-job' });

export class DatabaseDoctorJob extends Job {
  constructor() {
    super({
      runEveryInSeconds: 30, // each 30 seconds
      waitBeforeFirstRunInSeconds: 30,
    });
  }

  private async isDatabaseCreated(dbName: string): Promise<boolean> {
    // Check if the order database needs to recreate a new database
    const exist = (await indexedDB.databases()).some((info) => {
      if (!info.name) return false;
      return info.name!.indexOf(dbName) >= 0;
    });

    return exist;
  }

  /**
   * Run the Databases Check Configuration
   * @memberof DatabaseDoctorJob
   */
  async doTheJob() {
    // Check for the databases in pouchdb when a month passed
    // (create new databases when a new month appears)

    const dbOrdersName = OrdersClient.getDatabaseTemplate();

    if (!(await this.isDatabaseCreated(dbOrdersName))) {
      await OrdersClient.boot();
      chariot.warn(
        'order database was recreated to new one (template changed)'
      );
    }

    chariot.log('doctor just ran');
  }
}
export default new DatabaseDoctorJob();
