import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`server running on PORT ${process.env.PORT}`)
});