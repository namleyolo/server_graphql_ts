import * as Stripe from "stripe";
// console.log(process.env.STRIPE_SECRET);
export const stripe = new Stripe(process.env.STRIPE_SECRET!) ; 