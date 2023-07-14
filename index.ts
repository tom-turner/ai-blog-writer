import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser'
import routes from './routes';

const app = express();

app.use(bodyParser.json())
app.use(routes);

app.listen(5000, () => {
  console.log('Application started on port 5000!');
});