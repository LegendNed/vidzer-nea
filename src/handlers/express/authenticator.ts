import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken'

export default function (req: Request, res: Response, next: NextFunction) {
    try {
        const token: any = req.headers['Authorization'];
        if (!token) return res.status(401).send('Unauthorized');

        const payload = verify(token, process.env.SECRET)
        if (!payload) return res.clearCookie('token').status(401).send('Unauthorized');

        req['user'] = payload
        next()
    } catch (_) {
        return res.clearCookie('token').status(401).send('Unauthorized');
    }
}