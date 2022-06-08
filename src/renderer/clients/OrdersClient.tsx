// import csvParser from 'csv-parser';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import ChariotConsole from '../lib/ChariotConsole';
import WithBootedClient from '../lib/WithBootedClient';
import ConfigLoaderJob from '../jobs/ConfigLoaderJob';

const chariot = ChariotConsole({ label: 'orders-client' });
const ORDER_FILE_TEMPLATE = 'day-orders.csv';

export class OrdersClient implements WithBootedClient {
  async boot() {}

  resolverOrderFilePath(day?: Date): string {
    const dayOfOrder = moment(day || new Date()).add(-2, 'h');
    const folderPath = ConfigLoaderJob.getOrdersPath();
    const dayOrdersFolderName = dayOfOrder.format('YYYY-MM-DD');

    return path.join(folderPath, dayOrdersFolderName, ORDER_FILE_TEMPLATE);
  }

  async saveOrder(order: IOrder): Promise<void> {
    try {
      // Create or Get the order File
      const csvPath = this.resolverOrderFilePath();

      const values: string[] = [];
      const folderPath = path.dirname(csvPath);
      order.detail_path = path.join(folderPath, `order-${order.id}.csv`);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        // Add Headers
        fs.appendFileSync(csvPath, `${Object.keys(order).join(';')}\n`);
      }

      // ----------------------------------------------
      // Save the orders in the global day resume
      Object.keys(order).forEach((key) => {
        values.push((order as any)[key]);
      });
      fs.appendFileSync(csvPath, `${values.join(';')}\n`);
      // ----------------------------------------------

      // ----------------------------------------------
      // Now save the detail ^^ (product list and detail)
      fs.appendFileSync(order.detail_path, order.detail_path);
      // ----------------------------------------------
    } catch (ex) {
      chariot.error(ex as any);
      throw ex;
    }
  }
}

export interface IOrder {
  time: string;
  id: string;
  total_price: number;
  total_products: number;
  detail_path: string;
}

export default new OrdersClient();
