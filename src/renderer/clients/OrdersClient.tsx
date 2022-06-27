import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import moment from 'moment';
import IJwtEntity from 'renderer/models/IJwtEntity';
import IPouchDbResponse from 'renderer/lib/IPouchDbResponse';
import EventStreamer from 'renderer/lib/EventStreamer';
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

export class OrdersClient implements WithBootedClient {
  private db: PouchDB.Database<IOrder> | undefined;

  private db_template: string;

  constructor(config: IConfig) {
    this.db_template = config.db_template;
  }

  async boot(): Promise<void> {
    // process the template (reduce -2 hours to fix the "12:00" issue)
    const db_name = this.getDatabaseTemplate();

    this.db = new PouchDB(db_name, {
      auto_compaction: true,
      revs_limit: 1,
    });

    this.db.createIndex({
      index: { fields: ['_id'] },
    });

    this.db.createIndex({
      index: { fields: ['status'] },
    });

    this.db.createIndex({
      index: { fields: ['day'] },
    });

    this.db.createIndex({
      index: { fields: ['day', 'status'] },
    });
  }

  /**
   * Obtain the database template
   * @returns Return the database template
   */
  getDatabaseTemplate() {
    const now = moment();
    return now.add(-1, 'h').format(this.db_template);
  }

  /**
   * Get Pendings Orders
   * @param offset offset index
   * @param limit records limit
   */
  async getPendings(
    offset: number,
    limit: number
  ): Promise<IPouchDbResponse<IOrder>> {
    const results = await this.db!.find({
      skip: offset,
      limit,
      selector: { status: 'PENDING' },
      // fields: ['_id', 'name'],
      // sort: ['status'],
    });

    return {
      data: results.docs,
      limit,
      offset,
      total: results.docs.length,
    };
  }

  /**
   * Get all orders from the month
   * @param offset offset index
   * @param limit records limit
   */
  async getAll(
    offset: number,
    limit: number
  ): Promise<IPouchDbResponse<IOrder>> {
    const results = await this.db!.find({
      skip: offset,
      limit,
      selector: { status: 'PAID' },
      // fields: ['_id', 'name'],
      // sort: ['status'],
    });

    return {
      data: results.docs,
      limit,
      offset,
      total: results.docs.length,
    };
  }

  /**
   * Get all orders from specific day
   * @param day day of the month to retrieve
   * @param offset offset index
   * @param limit records limit
   */
  async getAllByDays(
    days: number[],
    offset: number,
    limit: number
  ): Promise<IPouchDbResponse<IOrder>> {
    const results = await this.db!.find({
      skip: offset,
      limit,
      selector: {
        day: {
          $in: days,
        },
        status: 'PAID',
      },
      // fields: ['_id', 'name'],
      // sort: ['status'],
    });

    return {
      data: results.docs,
      limit,
      offset,
      total: results.docs.length,
    };
  }

  /**
   * Get Pendings Count
   * @param status Pending Status
   */
  async getCount(status: 'PENDING' | 'PAID'): Promise<number> {
    const results = await this.db!.find({
      fields: ['_id'],
      selector: { status },
    });

    return results.docs.length;
  }

  async getCart(orderId: string): Promise<Record<string, IProductCart>> {
    const blob: Blob = (await this.db!.getAttachment(
      orderId,
      'cart.json'
    )) as Blob;

    const text = await blob.text();
    const cart = JSON.parse(text) as Record<string, IProductCart>;
    return cart;
  }

  async updateToPaid(id: string): Promise<void> {
    const recordToUpdate = await this.db!.get(id);
    recordToUpdate.status = 'PAID';
    await this.db!.put(recordToUpdate);

    EventStreamer.emit('PENDINGS:CHANGED', recordToUpdate);
  }

  /**
   * Save the order in the database
   * @param cart Cart to save
   */
  async save(
    cart: Record<string, IProductCart>,
    tags: string,
    pending: boolean
  ): Promise<void> {
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
      const now = moment().add(-1, 'h');
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
        status: pending ? 'PENDING' : 'PAID',
        tags,
      };

      await this.db!.put({
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
  status: 'PENDING' | 'PAID';
  tags: string;
}

export default new OrdersClient({
  db_template: '[orders-]YYYYMM',
});
