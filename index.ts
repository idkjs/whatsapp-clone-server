// https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial/master/next/step/4
import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';

import { chats } from './db';
import schema from "./schema";
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
// GET /_ping route. This route will be used to determine whether the server is up and running, and how fast the connection is based on the response time. For every request sent to this route, we should expect a response saying "pong". Some call it "heartbeat", because this route is being tested repeatedly by the hosting machine to check if it's alive, just like a heartbeat in a way.
// Test it with `curl localhost:4000/_ping`

app.get('/_ping', (req, res) => {
  res.send('pong');
  res.json(chats);
});

const server = new ApolloServer({ schema });

server.applyMiddleware({
  app,
  path: '/graphql',
});
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is listening on port http://localhost:${port}`);
});
