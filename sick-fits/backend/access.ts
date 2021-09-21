import { ListAccessArgs } from "./types";
import { permissionsList } from "./schemas/fields";

// The access control returns a yes or no value at its simplest
// depending on the users session

export function isSignedIn({session}: ListAccessArgs) {
    return !!session;
}

const generatedPermissions = Object.fromEntries(
    permissionsList.map((permission) => [
        permission,
        function ({session}:ListAccessArgs) {
            return !!session?.data.role?.[permission];
        },
    ])
);

//permissions check if someone meets a criteria
export const permissions = {
    ...generatedPermissions,
};


//rule based function

export const rules = {
    canManageProducts({ session }: ListAccessArgs) {
        if(!isSignedIn({ session })) {
            return false;
        }

        //Do they have canManageProducts permission
        if(permissions.canManageProducts({ session })) {
            return true;
        }

        //if not, do they own this item?
        return { user: { id: session.itemId } };
    },

    canOrder({ session }: ListAccessArgs) {
        if(!isSignedIn({ session })) {
            return false;
        }

        //Do they have canManageProducts permission
        if(permissions.canManageCart({ session })) {
            return true;
        }

        //if not, do they own this item?
        return { user: { id: session.itemId } };
    },

    canManageOrderItems({ session }: ListAccessArgs) {
        if(!isSignedIn({ session })) {
            return false;
        }

        //Do they have canManageProducts permission
        if(permissions.canManageCart({ session })) {
            return true;
        }

        //if not, do they own this item?
        return { order: { user: { id: session.itemId } } };
    },

    canReadProducts({ session }: ListAccessArgs) {
        if(!isSignedIn({ session })) {
            return false;
        }

        if(permissions.canManageProducts({ session })) {
            return true; //they can read everything!
        }

        //they ca only see products based on status filed
        return { status: 'AVAILABLE' }
    },

    canManageUsers({ session }: ListAccessArgs) {
        if(!isSignedIn({ session })) {
            return false;
        }

        if(permissions.canManageUsers({ session })) {
            return true;
        }

        //if not, they may only update themselves
        return { id: session.itemId };
    },
};