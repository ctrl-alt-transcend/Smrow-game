import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError) // catches only the prismaerror
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    switch (exception.code) {
      // error unique restriction, duplicated field, already in use
      case 'P2002': {
        const status = HttpStatus.CONFLICT; // 409
        const target =
          (exception.meta?.target as string) || exception.message || '';
        let afield = 'Unique field';
        const match = target.match(/constraint:\s*`([^`]+)`/i);
        const restrictionName = match ? match[1] : target;
        if (restrictionName) {
          const parts = restrictionName.split('_');
          if (parts.length >= 3) {
            afield = parts[1];
          } else {
            afield = restrictionName
              .replace('key', '')
              .replace(/[^a-zA-Z0-9]/g, '');
          }
        }

        response.status(status).json({
          statusCode: status,
          message: `${afield} is already in use`,  //TRANSLATE
          error: 'Conflict',
        });
        break;
      }
      // error not found, error in update or delete, register not found
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND; // 404
        response.status(status).json({
          statusCode: status,
          message: 'The register was not found, please try again.', //TRANSLATE
          error: 'Not found',                                       //TRANSLATE
        });
        break;
      }
      // error incorrect foreign key, incorrect field requested
      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST; // 400
        response.status(status).json({
          statusCode: status,
          message: 'Error in relation reference used (foreign key invalid.)', //TRANSLATE
          error: 'Bad request',                                               //TRANSLATE
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
