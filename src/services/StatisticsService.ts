import { PrismaClient, Session, User,  Business, Statistics, prisma } from '.prisma/client';
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

        this.router.post('/mobilegraph', async (req: Request, res: Response) => {
            let businessUuid: string = String(req.body.businessUuid);
            let start: string = String(req.body.startDate);
            let end: string = String(req.body.endDate);

            let startDate = new Date(start);
            let endDate= new Date(end);

            let business = await this.client.business.findUnique({
                where:{
                    uuid: businessUuid
                },
                include:{
                    statistics: true
                }
            });
            if(business == undefined || business == null  ){
                res.status(400)
                res.json("Internal error")
            }

            let statArray = business?.statistics.filter((value)=>{
                if(value.startDate > startDate && value.startDate < endDate){
                    return true;
                }
                else{
                    return false
                }
            });
            
            console.log(statArray);
            res.json(statArray);
        });

        this.router.post('/mobilestats', async (req: Request, res: Response) => {
            let ipAddress = '192.168.1.22';

            let stat = await this.client.statistics.findFirst({
                where: {
                    ipAddress: ipAddress
                },
                orderBy: {
                    endDate: 'desc'
                }
            });


            console.log(stat);

            res.status(200).json(stat);
        });
        

        // this.router.post('/test', async(req: Request, res: Response) =>{
        //         const result = await this.client.statistics.findMany({
        //             where:{
        //                 startDate:{
        //                     gte: new Date(),
                            
        //                 }
        //             }
        //         });
            

        // });
        this.router.post('/', async(req: Request, res: Response) =>{
            console.log('Test test tesat');
            
            let ipAddress: string = String(req.body.ipAddress);
            let startDate: Date= new Date(req.body.startDate);
            let endDate: Date=  new Date(req.body.endDate);
            let avgDistanceViolationDuration: number  = Number(req.body.avgDistanceViolationDuration);
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
