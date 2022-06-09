// import csvParser from 'csv-parser';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import ChariotConsole from '../lib/ChariotConsole';
import WithBootedClient from '../lib/WithBootedClient';
import ConfigLoaderJob from '../jobs/ConfigLoaderJob';
import { IProductCart } from './ProductsClient';

const chariot = ChariotConsole({ label: 'orders-client' });
const ORDER_FILE_TEMPLATE = 'day-orders.csv';

export class OrdersClient implements WithBootedClient {
  async boot() {}

  resolverOrderFilePath(day: moment.Moment): string {
    const folderPath = ConfigLoaderJob.getOrdersPath();
    const dayOrdersFolderName = day.format('YYYY-MM-DD');

    return path.join(folderPath, dayOrdersFolderName, ORDER_FILE_TEMPLATE);
  }

  async saveOrder(cart: Record<string, IProductCart>): Promise<void> {
    try {
      const dayOfOrder = moment(new Date()).add(-2, 'h');
      const timeOfOrder = moment();
      const orderId = timeOfOrder.format('YYYYMMDD[T]hhmmss');
      const csvPath = this.resolverOrderFilePath(dayOfOrder);      
      const folderPath = path.dirname(csvPath);
      const detailFilePath = path.join(folderPath, `${orderId}.csv`);
      let hasResumeHeaders = true;
      let hasDetailHeaders = true;
      let totalProducts = 0;
      let totalPrice = 0;

      // ------------------------------------------------------
      // Create the folder structure
      if (!fs.existsSync(folderPath)) {
        hasResumeHeaders = false;
        fs.mkdirSync(folderPath, { recursive: true });
      }
      // ------------------------------------------------------

      // ----------------------------------------------
      // --[ Save the detailed order into a file

      // Check if we need headers
      if (!fs.existsSync(detailFilePath)) {
        hasDetailHeaders = false;
      }

      // Iterate each product in the cart
      Object.keys(cart).forEach((sku: string) => {
        const productCart: IProductCart = cart[sku];
        totalPrice += productCart.quantity * productCart.price;
        totalProducts += productCart.quantity;

        // Add header if needed
        if (!hasDetailHeaders) {
          fs.appendFileSync(detailFilePath, `${Object.keys(productCart).join(';')}\n`);
          hasDetailHeaders = true;
        }

        // Add Product
        const productInCsvFormat: string[] = [];
        Object.keys(productCart).forEach((key) => {
          productInCsvFormat.push((productCart as any)[key]);
        });

        // Save the detailed file
        fs.appendFileSync(detailFilePath, `${productInCsvFormat.join(';')}\n`);
      });
      // ----------------------------------------------

      const order: IOrder = {
        id: orderId,
        time: timeOfOrder.format('YYYY-MM-DDThh:mm:ss'),
        total_price: totalPrice,
        total_products: totalProducts,
        detail_path: detailFilePath,
      };

      // ----------------------------------------------
      // --[ Save the orders in the global day resume

       // Add header if needed
      if (!hasResumeHeaders) {
        fs.appendFileSync(csvPath, `${Object.keys(order).join(';')}\n`);
        hasResumeHeaders = true;
      }

      // Add the resume 
      const resumeInCsvFormat: string[] = [];
      Object.keys(order).forEach((key) => {
        resumeInCsvFormat.push((order as any)[key]);
      });

      // Save the resume file
      fs.appendFileSync(csvPath, `${resumeInCsvFormat.join(';')}\n`);
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
