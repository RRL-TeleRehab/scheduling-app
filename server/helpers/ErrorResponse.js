class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message); // calling Error class constructor
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
