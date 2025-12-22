import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_do_not_use_in_production';
const JWT_EXPIRES_IN = '7d';

if (process.env.JWT_SECRET === undefined) {
  logger.warn('JWT_SECRET is not defined in environment variables. Using default secret.');
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
