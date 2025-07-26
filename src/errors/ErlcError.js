class ErlcError extends Error {
  constructor(message, code, status, originalError = null) {
    super(message);
    this.name = "ErlcError";
    this.code = code;
    this.status = status;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErlcError);
    }
  }

  /**
   * Returns a JSON representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

module.exports = ErlcError;
