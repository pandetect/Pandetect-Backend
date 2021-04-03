import express from 'express';
import {PrismaClient} from '@prisma/client';
import UserService from './services/UserService';

const app = express();
const client = new PrismaClient();
const port = process.env.PORT || 8080;

// All services here
const userService = new UserService(app, client);

// default index
app.get('/', async (req: express.Request, res: express.Response) => {
    res.json({
        message: 'Pandetect service is working well!'
    });
});

// Start connections
app.listen(port, async () => {
    console.log(`Started on http://localhost:${port}`);
    await client.$connect();
});

