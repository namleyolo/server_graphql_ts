import "reflect-metadata";
import "dotenv/config";

import {createConnection} from "typeorm";
// import createTokens from "./auth";
import {ApolloServer} from "apollo-server-express";

import {typeDefs} from "./typeDefs";
import {resolvers} from "./resolvers";
// import {stripe} from "./stripe";
import {verify} from "jsonwebtoken";

import * as express from "express";
import * as cookieParser from "cookie-parser"; 
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "./constants";
import { User } from "./entity/User";
import { createTokens } from "./auth";

// import * as session from "express-session";

// stripe;

const startServer = async () => {

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // context: ({req, res} : any) => ({req,res}) });
        context: ({req,res} : any) => {
            // console.log("req:::",req.cookies);
            // console.log("res::::",res.cookie);
            return {req,res}  }
    });

    await createConnection();
    const app = express();


    app.use(cookieParser())
    app.use(async  (req,res,next)=>{
          
        const accessToken = req.cookies['access-token'];
        const refreshToken = req.cookies['refresh-token'];

        if (!refreshToken && !accessToken) {
            return next();
        };
        if (!refreshToken) {
            return next();
        };
        try {
            const data = verify(accessToken,ACCESS_TOKEN_SECRET) as any;
            (req as any).userId = data.userId;   
        }
        catch {
            return next();
            // console.log(refreshToken,accessToken);
        };
        let data;
        try {
            data = verify(refreshToken,REFRESH_TOKEN_SECRET) as any;        
            // console.log("data::",data); 
        }
        catch{
            console.log("refreshToken is invalid ")
            return next();  
        }

        const user = await User.findOne(data.userId);
        // console.log("userL:::",user);
        try {
            console.log(user);
        } catch (error) {
            
        }
        if (!user || user.count !== data.count) {
            console.log('COUNT DIFFERENT');
            return next();
        }
        const tokens = createTokens(user);
        console.log("tokens::",tokens)
        res.cookie("access-token",tokens.accessToken);
        res.cookie("refresh-token",tokens.refreshToken);
        (req as any).userId = user.id;
        // data.userId;
        // data.count;

        next();
    });

    // server.applyMiddleware({app});  

    server.applyMiddleware({app,cors:{
            credentials : true,
            origin : "http://localhost:3000"
    }});  

    app.listen({port : 4000},() => {
        console.log("connected port 4000" + server.graphqlPath);

    });
}
startServer();