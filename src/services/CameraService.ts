import { PrismaClient, Session, Camera, Device, User} from '.prisma/client';
import {Express, Router, Response, Request, json} from 'express';
import { textChangeRangeIsUnchanged } from 'typescript';

export default class UserService {
    public app: Express;
    public client: PrismaClient;
    public router: Router;

    constructor(app: Express, client: PrismaClient) {
        this.app = app;
        this.client = client;
        this.router = Router();

        // GET: Camera cameras from the session 
        this.router.get('/', async(req: Request, res: Response) =>{
            let sessionToken: string= String(req.header('token'));
            console.log("in route: ", sessionToken);
            let cameras = await this.getCamerasFromSession(sessionToken);
            if(cameras == null || cameras == undefined){
                res.status(400);
                res.json("No cameras registered to user");
            }
            res.status(200);
            res.json(cameras);

        });
        // POST: change ip
        this.router.post('/changeip', async(req, res)=>{
            let camerauuid: string = req.body.camerauuid;
            let newIP: string = req.body.newIP;
            let camera = await this.client.camera.update({
                where:{
                    uuid: camerauuid,
                    
                },
                data:{
                    ipAddress: newIP
                }
            });
            if(camera == null || camera == undefined){
                res.status(400);
                res.json("unable to do update IP address");
            }
            res.json(newIP);
        });

        // POST: change PORT 
        this.router.post('/port', async(req, res)=>{
            let camerauuid: string = req.body.camerauuid;
            let newPort: number= Number(req.body.newPort);
            console.log("newport is: ", newPort /3);
            let camera = await this.client.camera.update({
                where:{
                    uuid: camerauuid
                },
                data:{
                    port: newPort
                }
            });
            console.log("user is :", camera);
            if(camera == null || camera == undefined){
                res.status(400);
                res.json("unable to update port");

            }
            res.status(200);
            res.json( newPort);
        });
        this.app.use('/camera', this.router);
    }

    private async getCamerasFromSession(token: string): Promise<Camera| undefined | null>{
        console.log("hey: ", token)
        const session = await this.client.session.findFirst({
            where:{
                token: token
            }
        });
        const user = await this.client.user.findUnique({
            where:{
               uuid: session?.userUuid
            }
        });
        if (user?.businessUuid === null || user == null) {
            return;
        }

        const device = await this.client.device.findFirst({
            where:{
                businessUuid: user.businessUuid
            }
        });
        const cameras = await this.client.camera.findFirst({
            where:{
                deviceUuid: device?.uuid
            }
        });

        console.log("CAMERA : ", cameras);
        return cameras;
    }
}