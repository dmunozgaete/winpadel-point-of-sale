/**
 * Expression Class (Guard Pattern)
 */
class Expressions {
  waitRandom(ms: number) {
    const randomInt = Math.floor(Math.random() * ms) + 10;
    return new Promise((res) => setTimeout(res, randomInt));
  }

  /**
   * Execute a callback when the condition is True
   * @param {boolean} condition Expression to Check
   * @param {()=>void} callback Function to execute if the condition is True
   * @param {() => void} [falseCallback] Function to execute if the condition is False
   */
  whenTrue(
    condition: boolean,
    callback: () => void,
    falseCallback?: () => void
  ) {
    if (condition) {
      callback();
    } else if (falseCallback) {
      falseCallback();
    }
  }

  /**
   * Execute a callback when the variable is not undefined
   * @param {boolean} variable Expression to Check
   * @param {()=>void} callback Function to execute if the condition is True
   */
  whenNotUndefined(variable: any, callback: () => void) {
    if (variable !== undefined) {
      callback();
    }
  }

  /**
   ** Execute a callback when the condition is False
   * @param {boolean} condition Expression to Check
   * @param {()=>void} callback Function to execute if the condition is False
   * @param {() => void} [trueCallback] Function to execute if the condition is True
   * @memberof Expressions
   */
  whenFalse(
    condition: boolean,
    callback: () => void,
    trueCallback?: () => void
  ) {
    if (!condition) {
      callback();
    } else if (trueCallback) {
      trueCallback();
    }
  }
}

export default new Expressions();
