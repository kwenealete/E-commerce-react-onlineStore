export default function calcTotalPrice(cart) {
    return cart.reduce((tally, cartItem) => {
        if(!cartItem.product) return tally; //takes care of deleted items still found in the cart
        return tally + cartItem.quantity * cartItem.product.price;
    } ,0);
}