# WhatsAppServer

## [CORS](https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial/master/next/step/3)

> Unlike the previous route, we used the .json() method this time around to send a response. This will simply stringify the given JSON and set the right headers. Similarly to the client, we've defined the db mock in a dedicated file, as this is easier to maintain and look at.

> It's also recommended to connect a middleware called cors which will enable cross-origin requests. Without it we will only be able to make requests in localhost, something which is likely to limit us in the future because we would probably host our server somewhere separate than the client application. Without it it will also be impossible to call the server from our client app. Let's install the cors library and load it with the Express middleware() function:

```sh
$ yarn add cors

# and its Typescript types:

$ yarn add --dev @types/cors
```

## Use CORS

```ts
import cors from 'cors';
import express from 'express';
import { chats } from './db';

const app = express();

app.use(cors());

app.get('/_ping', (req, res) => {
  res.send('pong');
});

app.get('/chats', (req, res) => {
  res.json(chats);
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
```

## Client Step 3.1: Define server URL

Add `.env` in root with `REACT_APP_SERVER_URL=http://localhost:4000` in your client app.

## How `REACT_APP_SERVER_URL` Works

> This will make our server's URL available under the process.env.REACT_APP_SERVER_URL member expression and it will be replaced with a fixed value at build time, just like macros. The .env file is a file which will automatically be loaded to process.env by the dotenv NPM package. react-scripts then filters environment variables which have a REACT_APP_ prefix and provides the created JSON to a Webpack plugin called DefinePlugin, which will result in the macro effect.

