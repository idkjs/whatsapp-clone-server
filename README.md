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

# [ADDING GRAPHQL](https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial/master/next/step/4)

## [Graphql Inspector](https://graphql-inspector.com/docs/installation)

`npm install --global @graphql-inspector/cli graphql`

```yml
- name: GraphQL Inspector
  uses: kamilkisiela/graphql-inspector@v2.0.0
```

## Custom Scalars

To define a concrete data without any inner schema definition, scalars are used in GraphQL. For example; Int, Float, Date, URL and EmailAddress.

The supported built-in scalar types in GraphQL are mostly primitive types:

- Int: Signed 32‐bit integer
- Float: Signed double-precision floating-point value
- String: UTF‐8 character sequence
- Boolean: true or false
- ID (serialized as String): A unique identifier, often used to refetch an object or as the key for a cache. While serialized as a String, ID signifies that it is not intended to be human‐readable

Any custom scalar can be declared with the scalar keyword, and custom types can be declared with the type keyword. Scalars have their own internal validation, parsing and serialization logics.

For example, you can have a custom scalar type DateTime. Due to JSON format restrictions, date objects are passed in string timestamp format or a number in milliseconds. Instead of having parsing, serialization, and validation logic in our business logic, we can define a DateTime scalar and put everything on it. So, we will have parsed native JavaScript Date object in our business logic while it is transferred as string or number like before.

[](https://medium.com/the-guild/graphql-scalars-1-0-is-out-more-types-data-integrity-and-strict-validations-on-graphql-972079428fb)

## Server Step 2.2: Create a basic GraphQL schema

```graphql
scalar Date
scalar URL

type Message {
  id: ID!
  content: String!
  createdAt: Date!
}

type Chat {
  id: ID!
  name: String!
  picture: URL
  lastMessage: Message
}

type Query {
  chats: [Chat!]!
}
```

## Server Step 2.2: Create a basic GraphQL schema

`yarn add graphql-tools graphql-import graphql-scalars`

`graphql-tools`is a library with a set of utilities that will help us create a schema that will be compatible with Apollo's API:

```ts
// schema/resolvers.ts
import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { chats } from '../db';

const resolvers = {
  Date: DateTimeResolver,
  URL: URLResolver,

  Query: {
    chats() {
      return chats;
    },
  },
};

export default resolvers;
```

