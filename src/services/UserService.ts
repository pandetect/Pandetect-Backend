import { PrismaClient, Session, User } from '.prisma/client';
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
        this.router.post('/activate', async(req, res)=>{
            let sessionToken: string= String(res.header('token'));
            let uuid: string = req.body.uuid;
            let admin = this.isAdmin(sessionToken); //
            if(admin && this.activateUser(uuid)){
                res.status(200);
                res.json("User activated successfully");
            }
            else{
                res.status(400);
                res.json("Couldnt active user");
            }
        });
        //Signup: POST username, password
        this.router.post('/signup', async (req: Request, res: Response) => {
            let username = req.body.username;
            let password = req.body.password;
            let email = req.body.email;
            console.log(username, password, email) 
            if (username == undefined || password == undefined || email == undefined) {
                res.status(501);
                res.json({});
                return;
            }
            const user = await this.userExist(username, password);
            console.log("user is here:" , user)
            if (user != undefined) {
                res.status(404);
                res.json("User with given credentials already exists, please try another name!");
            }
            
            const newUser = await this.createUser(username, password, email);
            if(newUser != undefined){
                res.status(200);
                res.json("User created successfuly");
            }
        });
        // Login: GET username, password
        this.router.post('/login', async (req: Request, res: Response) => {
            let username = req.body.username;
            let password = req.body.password;
            console.log(req.body)
            if (username == undefined || password == undefined ) {
                res.status(501);
                res.json("Bad request");
                return;
            }

            const user = await this.userExist(username, password);
            console.log("user here ", user);
            if (user == undefined) {
                res.status(404);
                res.json("Credentials are incorrect or account is not activated");
                return;
            }

            const session = await this.createSession(user);
            console.log("sesion here: ", session);
            res.json(session);
        });

        this.router.get('/logout', async (req: Request, res: Response) => {
            let sessionToken: string= String(req.header('token'));
            const success = await this.deleteSession(sessionToken);
            if(success){
                res.status(200);
                res.json("Logged out successfuly");
            }
            else{
                res.status(400);
                res.json("failed to logout");
            }
        });
        this.router.get('/', async (req: Request, res: Response) => {
            let session = req.header('token');
        });

        this.app.use('/users', this.router);
    }
    private async deleteSession(token: string): Promise<Boolean>{
        
        const {count} = await this.client.session.deleteMany({
            where:{
                token: token
            }
        });
        console.log("session: ", count);
        if(count == 0 || count == null){
            console.log("0 mi?????");
            return false;
        }
        return true;
    }
    private async createUser(username: string, password: string, email: string): Promise<User | undefined> {
        const user = await this.client.user.create({
            data: {
                username: username,
                password: password,
                email: email
            },
        });

        return user;
    }
    private async userExist(username: string, password: string): Promise<User | undefined> {
        const user = await this.client.user.findFirst({
            where: {
                username: username,
                password: password,
                
            }
        });

        if (user === null) {
            return undefined;
        }

        // if (user.activation == undefined) {
        //     return;
        // }

        return user;
    }

    private async activateUser(uuid: string): Promise<Boolean> {
        const user= await this.client.user.update({
            where:{
                uuid: uuid
            },
            data:{
                active: true
            }
        });
        if(user == undefined || user == null){
            return false;
        }
        return true;
    }
    private async createSession(newUser: User): Promise<Session | undefined> {
        let expDate = moment().add(1, 'day').format();
        // console.log(newUser.uuid);
        const session = await this.client.session.create({
            data: {
                expirationDate: expDate,
                userUuid: newUser.uuid
            }
        });

        return session;
    }
    private async isAdmin(sessionToken: string): Promise<Boolean| undefined> {
        
        let session = await this.client.session.findFirst({
            where:{
                token: sessionToken 
            }
        });
        if(session == null){
            return;
        }
        let uuid = session.userUuid; 
        const user = await this.client.user.findUnique({
            where:{
                uuid: uuid
            }
        });
        if(user == null)
            return;
        
        return user.admin;
         
    }
}