import {gql} from 'apollo-server-express';

export const typeDefs = gql`
     type User{
            id: ID!
            email:String!
     }
     type AllUser{
           id: ID
           email: String
     }


     type Query {
           me : User,
           get_all_user: [AllUser]
     }

     type Mutation {
           register(email: String!, password: String!): Boolean
           login(email: String!,password:String!)     : User
           createSubcription(source: String!) : User
           invalidateTokens: Boolean
     }


     type Subscription {
         postAdded: AllUser
     }
`