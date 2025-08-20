import { Router } from 'express';
import axios from 'axios';
import { requireAuth } from '../authMiddleware.js';
import crypto from 'crypto';
export const votesRouter = Router();
const VOTE_BASE = 'http://vote-service:3002';
votesRouter.post('/', requireAuth, async (req, res) => {
	try {
		// Derive stable UUID from IP hash for anonymous mode
		const hex = crypto.createHash('sha256').update(req.ip).digest('hex');
		const base = hex.slice(0,32);
		const anonUuid = `${base.slice(0,8)}-${base.slice(8,12)}-${base.slice(12,16)}-${base.slice(16,20)}-${base.slice(20)}`;
		const payload = { ...req.body, user_id: req.user?.sub || anonUuid };
		const { data } = await axios.post(`${VOTE_BASE}/votes`, payload);
		res.status(201).json(data);
	} catch (e){
		console.error('Vote proxy failed', e.response?.data || e.message);
		res.status(500).json({ error: 'vote failed' });
	}
});
