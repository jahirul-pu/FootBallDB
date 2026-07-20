import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, code: string = 'BUSINESS_ERROR', status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ success: false, message, code }, status);
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class ImportException extends BusinessException {
  constructor(message: string) {
    super(message, 'IMPORT_ERROR', HttpStatus.BAD_REQUEST);
  }
}

export class PermissionException extends BusinessException {
  constructor(message: string) {
    super(message, 'PERMISSION_DENIED', HttpStatus.FORBIDDEN);
  }
}
