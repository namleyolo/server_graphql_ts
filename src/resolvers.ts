import {IResolvers} from "graphql-tools";
import * as bcrypt from "bcryptjs";
import {User} from "./entity/User";
import {PubSub, } from 'apollo-server-express';
import { stripe } from "./stripe";
// const { PubSub } = require('apollo-server');

const pubsub = new PubSub();


const POST_ADDED = 'POST_ADDED';

// const pubsub = new PubSub();
export const resolvers: IResolvers  = {
    Query : {
        me :(_,__,{req}) => {
            // console.log("Session:::",req.session);
            if (!req.session.userId){
                return null
            }
            return User.findOne(req.session.userId);
        },
        get_all_user: async() => {
            return await User.find();
        },
    },
    Mutation: {
        register: async(_,{email,password},{args}) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            pubsub.publish(POST_ADDED, { postAdded: args });
            await User.create({
                email,
                password : hashedPassword
            }).save();

            return true;
        },
        login :  async(_, { email,password },{req}) => { 

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
            req.session.userId = user.id;
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
        }
    },
    Subscription: {
        postAdded: {
          // Additional event labels can be passed to asyncIterator creation
          subscribe: () => pubsub.asyncIterator([POST_ADDED]),
        },
      },
}