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

        //Signup: POST username, password
        this.router.post('/signup', async (req: Request, res: Response) => {
            let username = req.body('username');
            let password = req.body('password');
            let email = req.body('email');

            if (username == undefined || password == undefined || email == undefined) {
                res.status(501);
                res.json({});
                return;
            }

            const user = await this.userExist(username, password);

            if (user != undefined) {
                res.status(404);
                res.json("User with given credentials already exists, please try another name!");
                return;
            }
            
            const newUser = await this.createUser(username, password, email);
            if(newUser != undefined){
                res.status(200);
                res.json("User created successfuly");
                return;
            }
        });

        // Login: POST username, password
        this.router.post('/login', async (req: Request, res: Response) => {
            let username = req.header('username');
            let password = req.header('password');

            if (username == undefined || password == undefined ) {
                res.status(501);
                res.json({});
                return;
            }

            const user = await this.userExist(username, password);

            if (user == undefined) {
                res.status(404);
                res.json({});
                return;
            }

            const session = await this.createSession(user);

            res.json(session);
        });

        this.router.get('/', async (req: Request, res: Response) => {
            let session = req.header('token');
        });

        this.app.use('/users', this.router);
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
                password: password
            },
            include: {
                activation: true
            }
        });

        if (user === null) {
            return;
        }

        if (user.activation == undefined) {
            return;
        }

        return user;
    }

    private async createSession(user: User): Promise<Session | undefined> {
        let expDate = moment().add(1, 'day').format();

        const session = await this.client.session.create({
            data: {
                expirationDate: expDate
            }
        });

        return session;
    }
}