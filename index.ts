import 'dotenv/config'
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser'
import routes from './routes';

declare module 'express-session' {
  interface SessionData {
    apiKey: string;
  }
}
const app = express();
const app_secret = process.env.SECRET as string;
const dev = process.env.NODE_ENV !== 'production';

app.use(session({
  secret: app_secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: !dev },
}))
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(routes);

app.listen(5000, () => {
  console.log('Application started on port 5000!');
});