import { Router } from 'express';
import axios from 'axios';
export const votesRouter = Router();
const VOTE_BASE = 'http://vote-service:3002';
votesRouter.post('/', async (req, res) => {
	const { data } = await axios.post(`${VOTE_BASE}/votes`, req.body);
	res.status(201).json(data);
});
