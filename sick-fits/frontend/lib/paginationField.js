import { PAGINATION_QUERY } from "../components/Pagination";

export default function paginationField() {
    return {
        keyArgs: false, // tells apollo we are taking care of everything
        read(existing = [], { args, cache }) {
            // console.log({ existing, args, cache });
            const { skip, first } = args;
            
            //Read item number from the cache
            const data = cache.readQuery({ query: PAGINATION_QUERY });
            const count = data?._allProductsMeta?.count;
            const page = skip / first + 1;
            const pages = Math.ceil(count/first);

            //check if we have existing items
            const items = existing.slice(skip, skip + first).filter((x) => x);

            //if items don't satisfy how many were requested, and we're on last page, just return the items

            if(items.length && items.length !== first && page === pages) {
                return items;
            }
            
            if (items.length !== first) {
                //no items, so we have to go to the network to get them
                return false;
            }

            //if there are items, we just return them from the cache, no need to go the network
            if(items.length) {
                // console.log(
                //     `There are ${items.length} items in the cache! sending them to apollo`
                // );
                return items;
                
            }

            return false; // fallback to network
        },
        merge(existing, incoming, { args }) {
            const { skip, first } = args;
            //it runs when apollo client comes back with our products from the network

            // console.log(`Merging items from the network ${incoming.length}`);
            const merged = existing ? existing.slice(0) : [];
            for(let i = skip; i < skip + incoming.length; ++i) {
                merged[i] = incoming[i - skip];
            }
            // console.log(merged);
            //finally, we return the merged items from the cache
            return merged;
              
        },
    };
}