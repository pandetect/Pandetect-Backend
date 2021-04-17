
import { PrismaClient, Session, User, BusinessStatistic, Business } from '.prisma/client';
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
            //let statistics = await this.getStatistics(req.params.placeName);
            //return res.json(req.params.placename);
            if ( req.params.placename == undefined){
                res.status(400);
                return res.send("Invalid placename something");
            }
            let stat = await this.getStatistics(req.params.placename);
            return res.json(stat);
            
        });

        this.app.use('/statistics', this.router);
    }

    private async getStatistics(placeName: string): Promise<BusinessStatistic[]| undefined>{
        const business= await this.client.business.findUnique({
            where: {
                name: placeName
            }
        });
        let id = business?.uuid;

        let businessStatistics = await this.client.businessStatistic.findMany({
            where: {
                uuid: id
            }
        });
        return businessStatistics;
    }
}
