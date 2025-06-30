import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(err.stack);

    // Default error
    let error = {
        status: err.statusCode || 500,
        message: err.message || 'Internal Server Error',
    };

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { status: 404, message };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { status: 400, message };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val: any) => val.message);
        error = { status: 400, message: message.join(', ') };
    }

    res.status(error.status).json({
        success: false,
        error: error.message,
    });
};
