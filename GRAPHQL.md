# WhatsAppServer [ADDING GRAPHQL](https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial/master/next/step/4)

## [Graphql Inspector](https://graphql-inspector.com/docs/installation)

`npm install --global @graphql-inspector/cli graphql`

```yml
- name: GraphQL Inspector
  uses: kamilkisiela/graphql-inspector@v2.0.0
```

## Setup Apollo Server

Install the deps:
```sh
`yarn add apollo-server-express graphql`
`yarn add --dev @types/graphql`
```

`@types/graphql` - TypeScript definitions. Notice that we didn't need to install Apollo's types library. That is because Apollo themselves writes their source code in Typescript so we get a ready Typescript code directly from their library.


```ts
// modify index.ts
import { ApolloServer, gql } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import { chats } from './db';
import schema from './schema';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/_ping', (req, res) => {
  res.send('pong');
});

app.get('/chats', (req, res) => {
  res.json(chats);
});

const server = new ApolloServer({ schema });

server.applyMiddleware({
  app,
  path: '/graphql',
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
```

As you can see, the middleware requires a schema. A schema is composed mainly out of 2 fields:

- typeDefs (type definitions) - the schema types we wrote earlier this chapter for chats.
- resolvers - Functions that will provide the data for each field in typeDefs.

**You can think about our resolver functions as boxes on the shelf which we prepare for later, when GraphQL will execute them and for the schema as the label that describe those functions:**

This is why in `reasonml` we need the `introspectionSchema.json`? So that we have all the possible types available to us. We need it here too though, so...

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

Chats Query is even more interesting case with two exclamation marks [Chat!]!.

The outer exclamation mark means that if you run this query it will **always return an array of zero or more items (never null)** and inner exclamation mark means that every item of returned array will be of type Chat and never be `null`.


## Server Step 2.2: Create a basic GraphQL schema resolver

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
## Generate Schema from `schema/typeDefs.graphql` and `schema/resolvers.ts`

```ts
// schema/index.ts
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

const typeDefs = importSchema('schema/typeDefs.graphql');

export default makeExecutableSchema({ resolvers, typeDefs });


```
## Server Step 2.3: Resolve Chat.lastMessage

There's one optimization however, that we should make in our DB. Right now, each chat document has a direct reference to a message via the lastMessage field. Practically speaking, this is NOT how the data sits in the DB. The lastMessage should only holds the ID for the correlated message, and then in the Node.JS app, we should resolve it according to our needs. Let's make the appropriate changes in the resolver of the lastMessage field:

modify `schema/resolvers.ts`

```ts
import { DateTimeResolver, URLResolver } from 'graphql-scalars';
import { chats, messages } from '../db';

const resolvers = {
  Date: DateTimeResolver,
  URL: URLResolver,

  Chat: {
    lastMessage(chat: any) {
      return messages.find(m => m.id === chat.lastMessage);
    },
  },

  Query: {
    chats() {
      return chats;
    },
  },
};

export default resolvers;
```

**The first argument of the resolver is the raw chat data received by the `parent` of that resolver field `(chats resolver)`, and the returned result should be the mapped value which we would like to return to the client.**


Assuming that the server is running, we can already test our GraphQL endpoint. Because it's exposed to us via a REST endpoint, we can use a $ curl command to send a request to GET localhost:4000/graphql and get a response with all the data. Again, the query that we're gonna use to fetch the chats is:

```graphql
chats {
  id
  name
  picture
  lastMessage {
    id
    content
    createdAt
  }
}
```

The one-liner version of it with a `$ curl` command looks like so:

```sh
curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ chats { id name picture lastMessage { id content createdAt } } }" }' \
  localhost:4000/graphql
```

Header `Content-Type: application/graphql` doesnt work if no `bodyparser`.

```sh
curl \
  -X POST \
  -H "Content-Type: application/graphql" \
  --data '{ "query": "{ chats { id name picture lastMessage { id content createdAt } } }" }' \
  localhost:4000/graphql

#   ❯ curl \
#   -X POST \
#   -H "Content-Type: application/graphql" \
#   --data '{ "query": "{ chats { id name picture lastMessage { id content createdAt } } }" }' \
#   localhost:4000/graphql
# POST body missing. Did you forget use body-parser middleware?
```

The one-liner version of it with a [`$graphqurl`](https://github.com/hasura/graphqurl) command looks like so:

```sh
gq http://localhost:4000/graphql \
  -q 'query { chats { id name picture lastMessage { id content createdAt } } }' 
```