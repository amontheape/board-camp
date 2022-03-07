import Router from 'express';
import { deleteRental, getRentals, insertRental, returnRental } from '../controllers/rentalsController.js';
import validateSchemaMiddleware from '../middlewares/validateSchemaMiddleware.js';
import rentalsSchema from '../schemas/rentalsSchema.js';

const rentalsRouter = Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals', validateSchemaMiddleware(rentalsSchema), insertRental);
rentalsRouter.post('/rentals/:id/return', returnRental);
rentalsRouter.delete('/rentals/:id', deleteRental);

export default rentalsRouter;