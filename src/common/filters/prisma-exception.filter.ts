import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Logger } from 'nestjs-pino';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      message = 'Unique constraint failed';
    } else if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found';
    }

    response.status(status).send({
      success: false,
      error: { code: exception.code, message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
}
