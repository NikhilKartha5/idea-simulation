import { Router } from 'express';
import axios from 'axios';
export const commentsRouter = Router();
const COMMENT_BASE = 'http://comment-service:3003';
commentsRouter.post('/', async (req, res) => {
	const { data } = await axios.post(`${COMMENT_BASE}/comments`, req.body);
	res.status(201).json(data);
});
commentsRouter.get('/:idea_id', async (req, res) => {
	const { idea_id } = req.params;
	const { data } = await axios.get(`${COMMENT_BASE}/comments/${idea_id}`);
	res.json(data);
});
