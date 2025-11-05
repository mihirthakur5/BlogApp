import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ConflictException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const err: any = exception as any;

    // Postgres unique violation
    if (err?.driverError?.code === '23505') {
      response
        .status(409)
        .json({
          statusCode: 409,
          message: 'Conflict',
          detail: err?.driverError?.detail,
        });
      return;
    }

    // fallback
    response
      .status(500)
      .json({ statusCode: 500, message: 'Internal Server Error' });
  }
}
