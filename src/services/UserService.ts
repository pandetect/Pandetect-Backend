import { PrismaClient, Session, User } from '.prisma/client';
import {Express, Router, Response, Request} from 'express';
import moment from 'moment';

export default class UserService {
    public app: Express;
    public client: PrismaClient;
    public router: Router;

    constructor(app: Express, client: PrismaClient) {
        this.app = app;
        this.client = client;
        this.router = Router();

        // Login: GET username, password
        this.router.get('/', async (req: Request, res: Response) => {
            let username = req.header('username');
            let password = req.header('password');

            if (username == undefined || password == undefined) {
                res.status(501);
                return;
            }

            const user = await this.userExist(username, password);

            if (user == undefined) {
                res.status(404);
                return;
            }

            const session = await this.createSession(user);

            res.json(session);
        });

        this.app.use('/users', this.router);
    }

    private async userExist(username: string, password: string): Promise<User | undefined> {
        const user = await this.client.user.findFirst({
            where: {
                username: username,
                password: password
            }
        });

        if (user === null) {
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