
import { PrismaClient, Session, User, Business } from '.prisma/client';
import {Express, Router, Response, Request} from 'express';
import moment from 'moment';
import { textChangeRangeIsUnchanged } from 'typescript';

export default class UserService {
    public app: Express;
    public client: PrismaClient;
    public router: Router;

    constructor(app: Express, client: PrismaClient) {
        this.app = app;
        this.client = client;
        this.router = Router();
//test
        // GET: Places
        this.router.get('/', async(req: Request, res: Response) =>{
            let places = await this.client.business.findMany(); //get all business
            res.send(places);
        });
        this.app.use('/places', this.router);
    }
}