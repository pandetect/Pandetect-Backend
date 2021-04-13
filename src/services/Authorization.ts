import { PrismaClient } from ".prisma/client";

export function CheckSession(req: Request, res: Response, client: PrismaClient) {
    let token = req.header('token');
    
}