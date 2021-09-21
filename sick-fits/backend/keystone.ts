import { createAuth } from '@keystone-next/auth';
import { createSchema, config } from '@keystone-next/keystone/schema';
import 'dotenv/config';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';
import { Role } from './schemas/Role';
import { User } from './schemas/User';
import { OrderItem } from './schemas/OrderItem';
import { Order } from './schemas/Order';
import { Product } from './schemas/Product';
import { extendGraphqlSchema } from './mutations/index';
import { CartItem } from './schemas/CartItem';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { permissionsList } from './schemas/fields';

const databaseURL = 
    process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

 const sessionConfig = {
    maxAge : 60 * 60 * 24 * 360, //length one can stay signed in
    secret: process.env.COOKIE_SECRET,
 };   

 const { withAuth } = createAuth({
     listKey: 'User',
     identityField: 'email',
     secretField: 'password',
     initFirstItem: {
         fields: ['name', 'email', 'password'],
         //TODO, add initial roles here
     },
     passwordResetLink: {
         async sendToken(args) {
             //send the email
             await sendPasswordResetEmail(args.token, args.identity);
             
         }
     }
 })

 export default withAuth(
     config({
        server: {
            cors: {
                origin: [process.env.FRONTEND_URL],
                credentials: true,
            },
        },
        db: {
            adapter: 'mongoose',
            url: databaseURL,
            async onConnect(keystone) {
                console.log('connected to the database');
                if(process.argv.includes('--seed-data')){
                    await insertSeedData(keystone);
                }
            },
        },
        lists: createSchema({
            //schema goes in here
            User,
            Product,
            ProductImage,
            CartItem,
            OrderItem,
            Order,
            Role,
        }),
        extendGraphqlSchema,
        ui: {
            //UI to be shown only to those who pass this test
            isAccessAllowed: ({ session }) => {
                // console.log(session);
                return !!session?.data;
                
            },
        },
        session: withItemData(statelessSessions(sessionConfig), {
            User: `id name email role { ${permissionsList.join(' ')} }`
        })
    })
 );