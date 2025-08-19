import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({ points: parseInt(process.env.RATE_LIMIT_MAX||'100'), duration: parseInt(process.env.RATE_LIMIT_WINDOW||'60')/1000 });

export const rateLimiter = (req, res, next) => {
  limiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ error: 'Too Many Requests'}));
};
