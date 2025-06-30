import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};
