export default abstract class WithBootedClient {
  abstract boot(): Promise<void>;
}
