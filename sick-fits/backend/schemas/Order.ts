import { list } from '@keystone-next/keystone/schema';
import { text, select, integer, relationship, virtual } from '@keystone-next/fields';
import formatMoney from '../lib/formatMoney';
import { isSignedIn, rules } from '../access';


export const Order = list({
    access: {
        create: isSignedIn,
        read: rules.canManageOrderItems,
        update: () => false,
        delete: () => false
    },
    fields: {
        label: virtual({
            graphQLReturnType: 'String',
            resolver: function(item) {
                return `Coding is cool ${formatMoney(item.total)}`;
            }
        }),
        total: integer(),
        items: relationship({ ref: 'OrderItem.order', many: true }),
        user: relationship({ ref: 'User.orders' }),
        charge: text(),
    },
});