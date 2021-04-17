
import { PrismaClient, Session, User, Business } from '.prisma/client';
import {Express, Router, Response, Request, json} from 'express';
import moment from 'moment';
import { textChangeRangeIsUnchanged } from 'typescript';

export default class StatisticsService{
    public app: Express;
    public client: PrismaClient;
    public router: Router;

    constructor(app: Express, client: PrismaClient) {
        this.app = app;
        this.client = client;
        this.router = Router();
        
        this.router.get('/:placename', async(req: Request, res: Response) =>{
            console.log("place name is: ", req.params.placename);


            if ( req.params.placename == undefined){
                res.status(400);
                return res.send("Invalid placename something");
            }

            return;
        });

        this.app.use('/statistics', this.router);
    }
}
