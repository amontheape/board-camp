import Router from 'express';
import { getGames, insertGame } from '../controllers/gamesController.js';
import validateSchemaMiddleware from '../middlewares/validateSchemaMiddleware.js';
import gamesSchema from '../schemas/gamesSchema.js';

const gamesRouter = Router();

gamesRouter.get('/games', getGames);
gamesRouter.post('/games', validateSchemaMiddleware(gamesSchema), insertGame);

export default gamesRouter;