# Adding Router/ Adding a new Screen on Server Setup(https://www.tortilla.academy/Urigo/WhatsApp-Clone-Tutorial/master/next/step/6)

## Configuring `Chat` on server

The <Route /> component represents a path for a route in our application. Using the colon syntax (:chatId) we basically tell the router that the /chat route should be followed by a string whose value can later on be addressed via a parameter called chatId when navigating to the route. So here's a sum-up of the routes manifest:

- `/chats` - will navigate to the ChatsListScreen.
- `/chat/:chatId` - e.g. /chat/1, will navigate to the ChatRoomScreen and will parameterize it to show data which is related to chat ID 1.
- Any other route will fallback to the `/chats` route which will redirect us to the ChatsListScreen.

Now we will implement the `ChatRoomScreen` so the router can function properly. For now we will make it a plain screen which simply prints out the information of the chat that was clicked so we can have a complete flow, and then we will take care of the rest.

To do so, we will first implement the **chat query in our backend**. This would be a **[`parameterized query`](https://www.techopedia.com/definition/24414/parameterized-query)** that will provide us with a specific `chat` according to the received ID, and it will be used by the new screen as soon as it is initialized. First we would update the Chat type to contain a messages field so that we can access all the messages in a particular chat:

## Update `typeDefs.graphql` Chat

```sh
# modify schema/typeDefs.graphql
# before
type Chat {
  id: ID!
  name: String!
  picture: URL
  lastMessage: Message
}

# after
type Chat {
  id: ID!
  name: String!
  picture: URL
  lastMessage: Message
  messages: [Message!]!
}
```

## Update `resolvers` Chat

```ts
  Chat: {
    messages(chat: any) {
      return messages.filter(m => chat.messages.includes(m.id));
    },

    lastMessage(chat: any) {
      return messages.find((m) => m.id === chat.lastMessage);
    },
  },
```

## Update messages field to Chat type in `db.ts`

```ts
export const chats = [
  {
    id: '1',
    name: 'Ethan Gonzalez',
    picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
    lastMessage: '1',
    messages: ['1'],
  },
  ...
```

## Resolve last message based on messages array

After updated `db.ts` when we resolve Chat.lastMessage, we should get it directly from the Chat.messages field which means we dont need the `lastMessage` key in `db.ts` anymore and 
in `schema/resolver.ts` we will change:

```ts
  Chat: {
    messages(chat: any) {
      return messages.filter(m => chat.messages.includes(m.id));
    },

    lastMessage(chat: any) {
      return messages.find((m) => m.id === chat.lastMessage);
    },
  },
//  to

  Chat: {
    messages(chat: any) {
      return messages.filter((m) => chat.messages.includes(m.id));
    },

    lastMessage(chat: any) {
      const lastMessage = chat.messages[chat.messages.length - 1];

      return messages.find((m) => m.id === lastMessage);
    },
  },
```

## Add chat field to Query type

Now that we have created a call to `Chat` we have to add it to our schema's query type and handle it in the `Query` resolver:

```graphql
# schema/typeDefs.graphql
type Query {
  chats: [Chat!]!
  chat(chatId: ID!):Chat
}
```
```ts
// schema/resolvers.ts
type Query {
  chats: [Chat!]!
  chat(chatId: ID!):Chat
}
```

Lastly, add a test for it in `tests/queries`

```ts
// tests/queries/getChat.test.ts
import { createTestClient } from 'apollo-server-testing';
import { ApolloServer, gql } from 'apollo-server-express';
import schema from '../../schema';

describe('Query.chat', () => {
  it('should fetch specified chat', async () => {
    const server = new ApolloServer({ schema });

    const { query } = createTestClient(server);

    const res = await query({
      variables: { chatId: '1' },
      query: gql`
        query GetChat($chatId: ID!) {
          chat(chatId: $chatId) {
            id
            name
            picture
            lastMessage {
              id
              content
              createdAt
            }
          }
        }
      `,
    });

    expect(res.data).toBeDefined();
    expect(res.errors).toBeUndefined();
    expect(res.data).toMatchSnapshot();
  });
});
```

Test it with `yarn test`

```sh

~/Github/whatsapp-clone-server with-graphql
❯ yarn test
yarn run v1.22.4
$ jest
 PASS  tests/queries/getChats.test.ts (8.829 s)
 PASS  tests/queries/getChat.test.ts (8.835 s)
 › 1 snapshot written.

Snapshot Summary
 › 1 snapshot written from 1 test suite.

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   1 written, 1 passed, 2 total
Time:        11.539 s
Ran all test suites.
✨  Done in 13.91s.

~/Github/whatsapp-clone-server with-graphql 14s
❯ 
```