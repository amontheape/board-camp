import Router from 'express';
import { getCategories, insertCategory } from '../controllers/categoriesController.js';
import validateSchemaMiddleware from '../middlewares/validateSchemaMiddleware.js';
import categoriesSchema from '../schemas/categoriesSchema.js';


const categoriesRouter = Router();

categoriesRouter.get('/categories', getCategories);
categoriesRouter.post('/categories', validateSchemaMiddleware(categoriesSchema) ,insertCategory);

export default categoriesRouter;