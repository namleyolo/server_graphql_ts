import {gql} from 'apollo-server-express';

export const typeDefs = gql`
     type User{
            id: ID!
            email:String!
     }
     type AllUser{
           id: ID
           email: String
           stripeId : String
           password : String
     }

     type AllDevice{
           id : ID
           count: Int
           status : Int
     }


     type Query {
           me : User,
           get_all_user: [AllUser],
           get_all_device : [AllDevice]
     }

     type Mutation {
           register(email: String!, password: String!): Boolean
           login(email: String!,password:String!)     : User
           updateUser(email:String!, password: String!, newPassword: String!) : User 
           deleteUser(email:String,password: String,id: Int): Boolean
           createSubcription(source: String!) : User
           invalidateTokens: Boolean
     }


     type Subscription {
         postAdded: AllUser
     }
`