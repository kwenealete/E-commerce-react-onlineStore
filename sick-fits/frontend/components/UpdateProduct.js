import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import Form from './styles/Form';
import DisplayError from './ErrorMessage';
import useForm from '../lib/useForm';

const SINGLE_PRODUCT_QUERY = gql`
    query SINGLE_PRODUCT_QUERY($id: ID!) {
        Product(where: { id: $id }){
            id
            name
            description
            price
        }
    }
`;

const UPDATE_PRODUCT_MUTATION = gql`
    mutation UPDATE_PRODUCT_MUTATION(
        $id: ID!, $name: String, $description: String, $price: Int
    ) {
        updateProduct(
            id: $id
            data: { name: $name, description: $description, price: $price }
        ){
            id
            name
            description
            price

        }
    }
`;

export default function UpdateProduct({ id }) {
    // Getting the existing product to be edited
    const { data, error, loading } = useQuery
    (SINGLE_PRODUCT_QUERY, { variables: { id } });
    
    
    //Get the mutation to perform the update
   const [
       updateProduct,
       { data: updateData, error: updateError, loading: updateLoading },
   ] = useMutation(UPDATE_PRODUCT_MUTATION);

   //state for thr form inputs
   const {inputs, handleChange, clearForm, resetForm} = useForm(data?.Product);
   
   if(loading) return <p>loading...</p>
    return (
        <Form
            onSubmit= { async (e) =>{
                e.preventDefault();
                await updateProduct({
                    variables: {
                        id,                        
                        name: inputs.name,
                        description: inputs.description,
                        price: inputs.price
                        
                    }
                });
                                
            }}
        >
            <DisplayError error={error || updateError} />
            <fieldset disabled={updateLoading} aria-busy={updateLoading} >
            <label htmlFor="name">
                    Name
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Name"
                        value={inputs.name} 
                        onChange={handleChange}
                    />
                </label>
                <label htmlFor="price">
                    Price
                    <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="price"
                        value={inputs.price} 
                        onChange={handleChange}
                    />
                </label>
                <label htmlFor="name">
                    Description
                    <textarea
                        id="description"
                        name="description"
                        placeholder="description"
                        value={inputs.description} 
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" >Update Product</button>
            </fieldset>
        </Form>
    )
}