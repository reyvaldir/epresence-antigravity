import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

dotenv.config();

interface MyContext {
    token?: string;
    auth: any;
}

async function startSystem() {
    const app = express();
    const httpServer = http.createServer(app);

    // Set up Apollo Server
    const server = new ApolloServer<MyContext>({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();

    app.use(
        '/',
        cors<cors.CorsRequest>(),
        express.json(),
        // Add Clerk middleware
        ClerkExpressWithAuth(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.token;
                return {
                    token: Array.isArray(token) ? token[0] : token,
                    auth: (req as any).auth,
                };
            },
        }),
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/`);
}

startSystem();
