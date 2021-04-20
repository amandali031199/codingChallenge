
class VerifyDocumentError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.errorMessage = message;
   // This clips the constructor invocation from the stack trace.
   // It's not absolutely essential, but it does make the stack trace a little nicer.
   //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

class InputError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  VerifyDocumentError,
  InputError
};
