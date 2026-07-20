import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException 
      ? exception.getResponse() 
      : 'Internal server error';

    if (status >= 500) {
      this.logger.error({ err: exception, path: request.url });
    }

    response.status(status).send({
      success: false,
      error: {
        code: status,
        message: typeof message === 'string' ? message : (message as any).message || message,
      },
      meta: { timestamp: new Date().toISOString(), path: request.url }
    });
  }
}
