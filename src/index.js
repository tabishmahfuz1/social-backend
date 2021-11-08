require("dotenv").config();
const { createServer } = require('http');
const express = require('express');
// const { ApolloServer, makeExecutableSchema } = require("apollo-server");
const { ApolloServer } = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql');
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");
const { SubscriptionServer } = require('subscriptions-transport-ws');
const connectDB = require("./config/database");

const port = process.env.PORT || 8080;
// Connect Database
connectDB();
const app = express();
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });


const subscriptionServer = SubscriptionServer.create({
  // This is the `schema` we just created.
  schema,
  // These are imported from `graphql`.
  execute,
  subscribe,
}, {
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // This `server` is the instance returned from `new ApolloServer`.
  // path: server.graphqlPath,
});

const server = new ApolloServer({
  // typeDefs,
  // resolvers,
  schema,
  context: async ({ req }) => ({ req }),
  plugins: [{
    async serverWillStart() {
      return {
        async drainServer() {
          subscriptionServer.close();
        }
      };
    }
  }],
});

server.start().then(() => {
  server.applyMiddleware({ app });

  // console.log(`Server ready at ${url}`);
});

httpServer.listen(port, () =>
  console.log(`Server is now running on http://localhost:${port}/graphql`)
);

// server.listen(port).then(({ url }) => {
//   console.log(`Server ready at ${url}`);
// });
