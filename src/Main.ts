import express from 'express';
import {PrismaClient} from '@prisma/client';
import UserService from './services/UserService';
import StatisticsService from './services/StatisticsService';
import PlacesService from './services/LocationService';
import DeviceService from './services/DeviceService';
import CameraService from './services/CameraService';
import BusinessService from './services/BusinessService';
import bodyparser from 'body-parser';

const app = express();
const client = new PrismaClient();
const port = process.env.PORT || 8080;
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json())
app.use(bodyparser.json())
// All services here
const userService = new UserService(app, client);
const statisticsService = new StatisticsService(app, client);
const placesService = new PlacesService(app, client);
const devicesService = new DeviceService(app, client);
const cameraService= new CameraService(app, client);
const businessService= new BusinessService(app, client);

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

