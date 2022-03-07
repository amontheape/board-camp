import Router from 'express';
import { getCategories, insertCategory } from '../controllers/categoriesController.js';
import validateSchemaMiddleware from '../middlewares/validadteSchemaMiddleware.js';


const categoriesRouter = Router();

categoriesRouter.get('/categories', getCategories);
categoriesRouter.post('/categories', validateSchemaMiddleware ,insertCategory);

export default categoriesRouter;