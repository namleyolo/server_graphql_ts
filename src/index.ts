import "reflect-metadata";
import "dotenv/config";
import {createConnection} from "typeorm";
import {ApolloServer} from "apollo-server-express";

import {typeDefs} from "./typeDefs";
import {resolvers} from "./resolvers";
import {stripe} from "./stripe";


import * as express from "express";
import * as session from "express-session";

stripe;


const startServer = async () => {

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        subscriptions: {
            onConnect: () => console.log('Connected to websocket'),
            onDisconnect: () => console.log('Connected to websocket'),
        },
        context: ({req} : any) => ({req})   });
        // context: ({req} : any) => (console.log(req))   });

    await createConnection();
    const app = express();
    app.use(session({
        secret : "tokenbearer",
        resave: true,
        saveUninitialized : false
    }),
    );

    server.applyMiddleware({app,cors:{
        credentials : true,
        origin : "http://localhost:3000"
    }});  

    app.listen({port : 4000},() => {
        console.log("connected port 4000" + server.graphqlPath);
        // console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)

    });
}
startServer();