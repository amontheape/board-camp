import Router from 'express';
import { getCustomers, insertCustomer, updateCustomer } from '../controllers/customersController.js';
import validateSchemaMiddleware from '../middlewares/validateSchemaMiddleware.js';
import customersSchema from '../schemas/customersSchema.js';

const customersRouter = Router();

customersRouter.get('/customers', getCustomers);
customersRouter.get('/customers/:id', getCustomers);
customersRouter.post('/customers', validateSchemaMiddleware(customersSchema), insertCustomer);
customersRouter.put('/customers/:id', validateSchemaMiddleware(customersSchema), updateCustomer);

export default customersRouter;