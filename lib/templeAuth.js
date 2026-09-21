import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function makeAuthCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  // HttpOnly cookie string
  return `admin-token=${token}; Path=/; HttpOnly; Max-Age=${EXPIRES_IN}; SameSite=Lax; ${secure}`;
}