import { Request, Response } from 'express';

export default function(req: Request, res: Response, next: any) {
  const apiKey = req.headers['authorization'] || req.query.apiKey;
  const sessionApiKey = req.session.apiKey;

  if (!apiKey) {
    return res.status(401).json({ message: 'No API key provided' });
  }

  if(!sessionApiKey) {
    return res.status(401).json({ message: 'No session found' });
  }

  if (apiKey !== sessionApiKey) {
    return res.status(401).json({ message: 'Invalid API key' });
  }

  next();
}