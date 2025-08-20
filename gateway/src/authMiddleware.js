import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next){
  // Allow preflight requests to pass through without auth so browser can obtain CORS headers
  if (req.method === 'OPTIONS') return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if(!token){
    console.warn('[auth] missing token for', req.method, req.originalUrl);
    return res.status(401).json({ error: 'missing token'});
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e){
    console.warn('[auth] invalid token', e.message);
    return res.status(401).json({ error: 'invalid token'});
  }
}
