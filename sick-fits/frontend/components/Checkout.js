import styled from 'styled-components';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import SickButton from './styles/SickButton';
import { useState } from 'react';
import nProgress from 'nprogress';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { Router, useRouter } from 'next/dist/client/router';
import { useCart } from '../lib/cartState';
import { CURRENT_USER_QUERY } from './User';

const CheckoutFormStyles = styled.form`
    box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 5px;
    padding: 1rem;
    display: grid;
    grid-gap: 1rem;
`;

const CREATE_ORDER_MUTATION = gql`
    mutation CREATE_ORDER_MUTATION($token: String!) {
        checkout(token: $token) {
            id
            charge
            total
            items {
                id
                name
            }
        }
    }
`;

const stripeLib = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

function CheckoutForm() {
    const[error, setError] = useState();
    const[loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { closeCart } = useCart();
    const [checkout, { error: graphQLError }] = useMutation(
        CREATE_ORDER_MUTATION,
        {
            refetchQueries: [{ query: CURRENT_USER_QUERY }],
        }
    );

    async function handleSubmit(e) {
        
        //prevent the form from submitting 
        e.preventDefault();
        setLoading(true);
        console.log('we got some work to do...');

        // Starting the page transition
        nProgress.start();

        // Creating the payment method via stripe(token recieved if successful)
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement)
        });
        console.log(paymentMethod);

        // error handling from stripe
        if (error) {
            setError(error);
            nProgress.done();
            return; //stops the checkout from happening
        }

        // send recieved token to keystone server via a custom mutation
        const order = await checkout({
            variables: {
                token: paymentMethod.id
            }
        });
        console.log(`Finished with the order!!`);
        console.log(order);
        
        // change the page to permit order to be viewed
        router.push({
            pathname: `/order/[id]`,
            query: { id: order.data.checkout.id },
        });

        // close the cart
        closeCart();

        // turn the loader off
        setLoading(false);
        nProgress.done();
    }
    return (
            <CheckoutFormStyles onSubmit={handleSubmit}>
                {error && <p style={{ fontSize: 12 }}>{error.message}</p>}
                {graphQLError && <p style={{ fontSize: 12 }}>{graphQLError.message}</p>}
                <CardElement />
                <SickButton>Check Out Now</SickButton>
            </CheckoutFormStyles>
    );
}

function Checkout() {
    return (
        <Elements stripe={stripeLib}>
            <CheckoutForm />
        </Elements>
    )
}

export { Checkout };