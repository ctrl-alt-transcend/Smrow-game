import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';

type PrismaException =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientRustPanicError;

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
) // catches only the prismaerror
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: PrismaException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
      this.logger.error(`[Prisma Critical] ${exception.message}`);
      const status = HttpStatus.SERVICE_UNAVAILABLE;
      return response.status(status).json({
        statusCode: status,
        message: 'Server is currently unavailable. Please try again later.',
        error: 'Service Unavailable',
      });
    }

    this.logger.error(`[${exception.code}] ${exception.message}`);
    switch (exception.code) {
      case 'P1001':
      case 'P1002':
      case 'P1008':
      case 'P1017': {
        const status = HttpStatus.SERVICE_UNAVAILABLE;
        return response.status(status).json({
          statusCode: status,
          message:
            'Database service is currently down. Please try again later.',
          error: 'Service Unavailable',
        });
      }

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
          message: `${afield} is already in use`,
          error: 'Conflict',
        });
        break;
      }
      // error not found, error in update or delete, register not found
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND; // 404
        response.status(status).json({
          statusCode: status,
          message: 'The register was not found, please try again.',
          error: 'Not found',
        });
        break;
      }
      // error incorrect foreign key, incorrect field requested
      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST; // 400
        response.status(status).json({
          statusCode: status,
          message: 'Error in relation reference used (foreign key invalid.)',
          error: 'Bad request',
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
