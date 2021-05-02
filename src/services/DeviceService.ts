
import { PrismaClient, Session, User, Business, Device } from '.prisma/client';
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
        // POST: update ip address
        this.router.post('/ipaddress', async(req: Request, res: Response) =>{
            let token: string = String(res.header('token'));
            let uuid: string = req.body.uuid;
            let ipAddresss: string= req.body.ipaddress;
            let result = await this.updateIPAdress(uuid, ipAddresss);

            if(result){
                res.status(200);
                res.json("Updated successfuly newip: " + ipAddresss);
            }
            else{
                res.status(400);
                res.json("Failed updating ip");
            }

        });
        // POST :Register device 
        this.router.get('/register', async(req: Request, res: Response) =>{
            let token: string = String(res.header('token'));
            let uuid: string = String(req.header('uuid'));
            let ipAddresss: number= Number(res.header('ipadress'));
            let macAddresss: number= Number(res.header('macadress'));

        });
        // GET: Get device
        this.router.get('/:uuid', async(req, res)=>{
            let uuid: string = String(req.params.uuid);
            console.log("uuid: ", uuid);
            let device = await this.getDevice(uuid); 
            if(device){
                res.status(200);
                res.json(device);
            }
            else{
                res.status(400);
                res.json("Couldnt find device");
            }
        });
        // POST: Link camera
        this.router.get('/camera', async(req, res)=>{
            let uuid: string = String(res.header('uuid'));


        });
        this.app.use('/device', this.router);
    }

    private async linkCamera(uuid: string ): Promise<Boolean>{
        return false;

    }
    private async getDevice(uuid: string ): Promise<Device | null>{
        const device = await this.client.device.findUnique({
            where:{
                uuid: uuid
            }
        });

        return device;

    }
    private async updateIPAdress(uuid: string, ipAddress: string ): Promise<Boolean>{
        console.log("uuid: ", uuid);
        console.log("ip: ", ipAddress);
        const device = await this.client.device.update({
            where:{
                uuid: uuid
            },
            data:{
                localAddress: ipAddress
            }
        });

        if(device == null || device == undefined)
            return false;
        console.log("device = ", device);
        return true;
    }
    private async registerDevice(uuid: string, macAddress: string, ipAddress: string ): Promise<Boolean>{
        const device = await this.client.device.create({
            data:{
                macAddress: macAddress,
                localAddress: ipAddress,
                businessUuid: uuid
            }
        });

        if(device == null || device == undefined){
            return false;
        }
        console.log("device: ", device);
        // const business = this.client.business.update({
        //     where:{
        //         uuid: uuid
        //     },
        //     data:{
        //         devices: device
        //     }
        //     }
        // });
        return true;
    }
}