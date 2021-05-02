import { PrismaClient, Session, User } from '.prisma/client';
import {Express, Router, Response, Request} from 'express'

export function CheckSession(req: Request, res: Response, client: PrismaClient) {
    let token = req.header('token');
    
}