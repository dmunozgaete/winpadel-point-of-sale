import csvParser from 'csv-parser';
import fs from 'fs';
import ChariotConsole from '../lib/ChariotConsole';
import WithBootedClient from '../lib/WithBootedClient';
import ConfigLoaderJob from '../jobs/ConfigLoaderJob';

const chariot = ChariotConsole({ label: 'products-client' });

export class ProductsClient implements WithBootedClient {
  async boot() {}

  async getAll(): Promise<Array<IProduct>> {
    try {
      const csvPath = ConfigLoaderJob.getProductsFilePath();
      const results: IProduct[] = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csvParser({ separator: ';' }))
          .on('data', (data) => results.push(data))
          .on('error', reject)
          .on('finish', resolve);
      });

      // Resolve Url or Src
      results.forEach((product: IProduct) => {
        product.price = parseInt(`${product.price}`);
        product.image = ConfigLoaderJob.resolveUrl(product.image);
      });

      return results;
    } catch (ex) {
      chariot.error(ex as any);
      throw ex;
    }
  }
}

export interface IProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface IProductCart extends IProduct {
  quantity: number;
}

export default new ProductsClient();
