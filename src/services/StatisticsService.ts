import { PrismaClient, Session, User,  Business, Statistics } from '.prisma/client';
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
        

        this.router.post('/', async(req: Request, res: Response) =>{
            let ipAddress: string = String(req.body.ipAddress);
            let startDate: Date= new Date(req.body.startDate);
            let endDate: Date=  new Date(req.body.endDate);
            let avgDistanceViolationDuration: number= Number(req.body.avgDistanceViolationDuration);
            let avgNumberOfUnmasked: number= Number(req.body.avgNumberOfUnmasked);
            let avgNumberOfMasked : number= Number(req.body.avgNumberOfMasked);
            let avgNumberOfUncertain: number= Number(req.body.avgNumberOfUncertain);
            let avgNumberOfPeople: number= Number(req.body.avgNumberOfPeople);
            let numberOfFrames: number= Number(req.body.numberOfFrames);
            
            const stat = await this.client.statistics.create({
                data:{
                    ipAddress: ipAddress,
                    startDate: startDate,
                    endDate: endDate,
                    avgDistanceViolationDuration: avgDistanceViolationDuration,
                    avgNumberOfUnmasked: avgNumberOfUnmasked,
                    avgNumberOfMasked: avgNumberOfMasked,
                    avgNumberOfUncertain: avgNumberOfUncertain,
                    avgNumberOfPeople: avgNumberOfPeople,
                    numberOfFrames: numberOfFrames
                }
            });
            if(stat == undefined || stat == null){
                res.status(400);
                res.json("unable to create status")
            }
            console.log(stat);
            res.status(200);
            res.json("Successfuly created stat")

        });

        this.router.get('/:placename', async(req: Request, res: Response) =>{
            console.log("place name is: ", req.params.placename);


            if ( req.params.placename == undefined){
                res.status(400);
                return res.send("Invalid placename something");
            }
            //let stat = await this.getStatistics(req.params.placename);
            //return res.json(stat);
            
        });

        this.app.use('/statistics', this.router);
    }

    // private async getStatistics(placeName: string): Promise< undefined>{
    //     const business= await this.client.business.findUnique({
    //         where: {
    //             name: placeName
    //         }
    //     });
    //     let id = business?.uuid;

    //    // let businessStatistics = await this.client.businessStatistic.findMany({
    //         where: {
    //             uuid: id
    //         }
    //     });
    //     return businessStatistics;
    // }
}
