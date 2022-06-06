import WithBootedClient from './WithBootedClient';

interface IConfig {
  runEveryInSeconds: number;
  waitBeforeFirstRunInSeconds?: number;
}

/**
 * Job Abstract class that works like a programmatic job that need to run at every X time
 *
 * @export
 * @abstract
 * @class Job
 * @implements {WithBootedClient}
 */
export default abstract class Job implements WithBootedClient {
  private config: IConfig;

  private onEndRunningFunction?: () => void;

  constructor(config: IConfig) {
    this.config = config;
  }

  async boot() {
    const waitBeforeRun = (this.config.waitBeforeFirstRunInSeconds || 0) * 1000;
    if (waitBeforeRun === 0) {
      // Start inmediately
      await this.run();
    } else {
      setTimeout(() => {
        this.run();
      }, waitBeforeRun);
    }
  }

  /**
   * Execute run that inmediately execute after tha last running and wait until the end
   * @returns {Promise<void>}
   * @memberof Job
   */
  forceRun(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.onEndRunningFunction = async () => {
        await this.doTheJob();
        resolve();
      };
    });
  }

  /**
   * Run the Job
   * @private
   * @returns {Promise<void>}
   * @memberof Job
   */
  private async run(): Promise<void> {
    const { runEveryInSeconds } = this.config;
    try {
      await this.doTheJob();

      // call inmediately after the run end
      if (typeof this.onEndRunningFunction === 'function') {
        const handler = this.onEndRunningFunction;
        this.onEndRunningFunction = undefined;
        await handler();
      }
    } catch (ex) {
      console.error(ex);
      throw ex;
    } finally {
      setTimeout(() => {
        // console.log('start job');
        this.run();
      }, runEveryInSeconds * 1000);
    }
  }

  /**
   * Execute function that call on every tick of the job (according to the timing pass in the config)
   *
   * @abstract
   * @returns {Promise<void>}
   * @memberof Job
   */
  abstract doTheJob(): Promise<void>;
}
