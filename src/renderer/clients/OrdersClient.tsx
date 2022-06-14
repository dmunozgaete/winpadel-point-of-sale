import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import moment from 'moment';
import IJwtEntity from 'renderer/models/IJwtEntity';
import ChariotConsole from '../lib/ChariotConsole';
import WithBootedClient from '../lib/WithBootedClient';
import { IProductCart } from './ProductsClient';
import AuthenticationClient from './AuthenticationClient';

const chariot = ChariotConsole({ label: 'orders-client' });

// Install find plugin
PouchDB.plugin(PouchDBFind);

interface IConfig {
  db_template: string;
}

class OrdersClient implements WithBootedClient {
  private db: PouchDB.Database;

  constructor(config: IConfig) {
    // process the template (reduce -2 hours to fix the "12:00" issue)
    const db_name = moment().add(-2, 'h').format(config.db_template);

    this.db = new PouchDB(db_name, {
      revs_limit: 1,
    });

    this.db.createIndex({
      index: { fields: ['_id'] },
    });

    this.db.createIndex({
      index: { fields: ['year', 'month', 'day'] },
    });

    this.db.createIndex({
      index: { fields: ['year', 'month'] },
    });
  }

  async boot(): Promise<void> {}

  async save(cart: Record<string, IProductCart>): Promise<void> {
    try {
      let totalProducts = 0;
      let totalPrice = 0;

      // ----------------------------------------------
      // Iterate each product in the cart
      Object.keys(cart).forEach((sku: string) => {
        const productCart: IProductCart = cart[sku];
        totalPrice += productCart.quantity * productCart.price;
        totalProducts += productCart.quantity;
      });
      // ----------------------------------------------

      const user = AuthenticationClient.getInfo();
      const now = moment();
      const order: IOrder = {
        user,
        _id: now.format('YYYYMMDDTHHmmss'),
        year: parseInt(now.format('YYYY')),
        month: parseInt(now.format('MM')),
        day: parseInt(now.format('DD')),
        created_at: new Date().toISOString(),
        amount: totalPrice,
        currency: 'CLP',
        product_quantity: totalProducts,
      };

      await this.db.put({
        ...order,
        _attachments: {
          'cart.json': {
            content_type: 'application/json',
            data: new Blob([JSON.stringify(cart)], {
              type: 'application/json',
            }),
          },
        },
      });

      // ----------------------------------------------
    } catch (ex) {
      chariot.error(ex as any);
      throw ex;
    }
  }
}

export interface IOrder {
  _id: string;
  user: IJwtEntity;
  created_at: string;
  year: number;
  month: number;
  day: number;
  amount: number;
  currency: string;
  product_quantity: number;
}

export default new OrdersClient({
  db_template: '[orders-]YYYYMM',
});
