import os from 'os';
import path from 'path';
import fs from 'fs';
import ChariotConsole from '../lib/ChariotConsole';
import Job from '../lib/Job';

const CONFIGURATION_FOLDER = 'winpadel';
const DATABASE_FOLDER = 'db';
const ASSETS_FOLDER = 'assets';
const USERS_FILENAME = 'users.csv';
const PRODUCTS_FILENAME = 'products.csv';
const SLOTS_FILENAME = 'slots.csv';

const chariot = ChariotConsole({ label: 'config-job' });
interface IConfiguration {
  home_path: string;
  database_path: string;
  assets_path: string;
  users_path: string;
  slots_path: string;
  products_path: string;
  is_debug: boolean;
}

export class ConfigLoaderJob extends Job {
  appConfig: IConfiguration = {
    database_path: '',
    home_path: '',
    assets_path: '',
    users_path: '',
    products_path: '',
    slots_path: '',
    is_debug: process.env.NODE_ENV === 'development',
  };

  constructor() {
    super({
      runEveryInSeconds: 2147483, // each 24 days
      waitBeforeFirstRunInSeconds: 0,
    });
  }

  /**
   * Get user home data full path
   */
  getHomePath() {
    return this.appConfig.home_path;
  }

  /**
   * Get database full path
   * @returns string
   */
  getDatabasePath() {
    return this.appConfig.database_path;
  }

  /**
   * Get users database path
   * @returns string
   */
  getUsersFilePath() {
    return this.appConfig.users_path;
  }

  /**
   * Get products database path
   * @returns string
   */
  getProductsFilePath() {
    return this.appConfig.products_path;
  }

  /**
   * Get Slots database path
   * @returns string
   */
  getSlotsPath() {
    return this.appConfig.slots_path;
  }

  /**
   * Resolve the url
   * @param src url to resolve
   * @returns string
   */
  resolveUrl(src: string) {
    let resolvedUrl = src;
    if (src.startsWith('assets')) {
      resolvedUrl = path.join(this.getDatabasePath(), src);
      const exists = fs.existsSync(resolvedUrl);
      if (!exists) {
        console.log('dont exists', resolvedUrl);
      }

      return `file://${resolvedUrl}`;
    }

    // console.log('url:', src, 'resolved to:', resolvedUrl);
    return resolvedUrl;
  }

  /**
   * Return if the environment is in debug or production
   * @returns boolean
   */
  isDebug() {
    return this.appConfig.is_debug;
  }

  /**
   * Obtain the Base Configuration
   * @memberof ConfigLoaderJob
   */
  async doTheJob() {
    const homePath = this.appConfig.is_debug
      ? '/Users/davidmunozgaete/Documents/Git/winpadel/point-of-sale-app'
      : os.homedir();

    this.appConfig.home_path = homePath;
    this.appConfig.database_path = path.join(
      homePath,
      CONFIGURATION_FOLDER,
      DATABASE_FOLDER
    );

    this.appConfig.assets_path = path.join(
      this.appConfig.database_path,
      ASSETS_FOLDER
    );

    this.appConfig.users_path = path.join(
      this.appConfig.database_path,
      USERS_FILENAME
    );

    this.appConfig.products_path = path.join(
      this.appConfig.database_path,
      PRODUCTS_FILENAME
    );

    this.appConfig.slots_path = path.join(
      this.appConfig.database_path,
      SLOTS_FILENAME
    );

    chariot.log('application config:', this.appConfig);
  }
}
export default new ConfigLoaderJob();
