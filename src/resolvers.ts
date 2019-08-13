import {IResolvers} from "graphql-tools";
import * as bcrypt from "bcryptjs";
// import {sign} from "jsonwebtoken";
import {User} from "./entity/User";
import {Device} from "./entity/Device";
// import {PubSub, } from 'apollo-server-express';
import { stripe } from "./stripe";
// import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "./constants";
import { createTokens } from "./auth";

// const pubsub = new PubSub();


// const POST_ADDED = 'POST_ADDED';

// const pubsub = new PubSub();
export const resolvers: IResolvers  = {
    Query : {
        me :(_,__,{req}) => {
            if (!req.userId){
                return null
            }
            console.log("user ID:::",req.userId);
            return User.findOne(req .userId);
        },
        get_all_user: async() => {
            return await User.find();
        },
        get_all_device : (_,__,{req}) => {
            if (!req.userId){
                return null
            }
            return Device.find();
        } 
    },
    Mutation: {
        register: async(_,{email,password}) => {
            const checkUser = await User.findOne({where: {email: email}});
            if (checkUser) {
                return null;
            };

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                email,
                password : hashedPassword
            }).save();

            return true;
        },
        login :  async(_, { email,password },{res}) => { 

            const user = await User.findOne({where:{email }});
            // console.log(user);
            if (!user) {
                return null;
            }
            const valid = await bcrypt.compare(password, user.password);
            // console.log(valid);
            if (!valid) {
                return null ;   
            }
            console.log("res::::",res.cookie);
            // name , value , option

            const {accessToken,refreshToken} = createTokens(user);
            // console.log("accessToken",accessToken);
            // console.log("refreshToken",refreshToken);
            

            res.cookie("refresh-token",refreshToken,{expire: 60*60*24*7});
            res.cookie("access-token",accessToken,{expire: 60*7});
            return user ;
        },
        createSubcription: async (_,{source},{req}) => {
            console.log(source);
            if(!req.session || !req.session.userId) {
                throw new Error("not authenticated");
            } 
            const user = await User.findOne(req.session.userId); 
            if (!user) {
                throw new Error();
            }
            const customer = await stripe.customers.create({
                email: user.email,
                source,
                // plan :process.env.PLAN  
            });
            // console.log(process.env.PLAN);
            user.stripeId = customer.id;
            user.type = "paid";
            await user.save();
            return user;
        },
        invalidateTokens: async(_,__,{req}) => {
            if (!req.userId){
                return false;
            } 
            const user = await User.findOne(req.userId);
            if (!user) {return false}
            user.count +=1 ;
            await user.save();
            return true;
        }
    },
    Subscription: {
        postAdded: {
          // Additional event labels can be passed to asyncIterator creation
        //   subscribe: () => pubsub.asyncIterator([POST_ADDED]),
        },
      },
}