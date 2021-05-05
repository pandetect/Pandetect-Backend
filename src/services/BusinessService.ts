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


        // GET: Business
        this.router.get('/', async(req: Request, res: Response) =>{
            let sessionToken: string = String(req.header("token"));
            let password: string = String(req.header("password"));
            console.log("tok: ", sessionToken)
            console.log("password : ", password)
            const device = await this.getBusiness(sessionToken);
            if(device != null){
                res.status(200);
                res.json(device);
            }
            else{
                res.status(400);
                res.json("Device not found");
            }
        });
        this.app.use('/business', this.router);
    }

    private async getBusiness(token:string) : Promise<Business | undefined | null>{
        console.log("tokeeeen:", token);
        let session = await this.client.session.findFirst({
            where:{
                token:token 
            }
        });
        console.log("session :" , session);
        if (session == null || session == undefined)
            return null;
        
        const user = await this.client.user.findUnique({
            where:{
                uuid: session.userUuid
            }
        });

        console.log("user: " , user);
        if (user == null || user == undefined || user.businessUuid == null || user.businessUuid == undefined)
            return null;

        const business: Business | null = await this.client.business.findFirst({
            where:{
                uuid: user.businessUuid
            }
        });

        console.log("business: " , business);
        return business;
            
    }
}