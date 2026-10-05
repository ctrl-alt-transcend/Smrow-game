
import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from 'generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError) // catches only the prismaerror
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, ''); // clean newlines from Prisma log
    switch (exception.code) {
		// error unique restriction, duplicated field, already in use
      case 'P2002': {
        const status = HttpStatus.CONFLICT; // 409
        response.status(status).json({
          statusCode: status,
          message: `${(exception.meta?.target as string[]).join(', ')} is already in use`,
		  error: 'Conflict'
        });
        break;
      }
	  	// error not found, error in update or delete, register not found
	  case 'P2025': {
		const status = HttpStatus.NOT_FOUND; // 404
		response.status(status).json({
			statusCode: status,
			message: 'The register was not found, please try again.',
			error: 'Not found'
		});
		break;
	  }
	  	// error incorrect foreign key, incorrect field requested
	  case 'P2003': {
		const status = HttpStatus.BAD_REQUEST; // 400
		response.status(status).json({
			statusCode: status,
			message: 'Error in relation reference used (foreign key invalid.)',
			error: 'Bad request'
		});
		break;
	  }
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
