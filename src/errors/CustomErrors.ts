export class BadRequestError extends Error {
    statusCode: number;
  
    constructor(message: string) {
      super(message);
      this.statusCode = 400;
      Object.setPrototypeOf(this, BadRequestError.prototype);
    }
  }
  
  export class NotFoundError extends Error {
    statusCode: number;
  
    constructor(message: string) {
      super(message);
      this.statusCode = 404;
      Object.setPrototypeOf(this, NotFoundError.prototype);
    }
  }

  export class ForbiddenError extends Error {
    statusCode: number;
  
    constructor(message: string) {
      super(message);
      this.statusCode = 403;
      Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
  }

  export class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ValidationError";
    }
  }
  
  