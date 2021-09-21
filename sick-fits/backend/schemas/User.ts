import { list } from "@keystone-next/keystone/schema";
import { text, password, relationship } from '@keystone-next/fields';
import { rules, permissions } from "../access";

export const User = list({
    access:{
        create: () => true,
        read: rules.canManageUsers,
        update: rules.canManageUsers,
        delete: permissions.canManageUsers, //possible for only those with the permission.
    },
    ui: {
        hideCreate: args => !permissions.canManageUsers(args),
        hideDelete: args => !permissions.canManageUsers(args),
    },
    fields: {
        name: text({ isRequired: true }),
        email: text({ isRequired: true, isUnique: true }),
        password: password(),
        cart: relationship({ 
            ref: 'CartItem.user', 
            many: true,
            ui: {
                createView: { fieldMode: 'hidden' },
                itemView: { fieldMode: 'read' }
            }
        }),
        orders: relationship({ ref: 'Order.user', many: true }),
        role: relationship({
            ref: 'Role.assignedTo',
            access: {
                create: permissions.canManageUsers,
                update: permissions.canManageUsers
            }
        }),
        products: relationship({
            ref: 'Product.user',
            many: true,
        }),
        
    }
})