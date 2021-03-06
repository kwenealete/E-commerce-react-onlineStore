import { useEffect, useState } from 'react';

export default function useForm(initial = {}) {
    //create a state object for inputs
    const [inputs, setInputs] = useState(initial);
    const initialValues = Object.values(initial).join('');

    useEffect(() => {
        //This function runs when things we are watching are changing
        setInputs(initial);
    }, [initialValues]); 

    function handleChange(e) {
        let { value, name, type } = e.target;
        if(type === 'number') {
            value = parseInt(value);
        }

        if(type === 'file') {
            [value] = e.target.files;
        }
        setInputs({
            //copy the existing state
            ...inputs,
            [name]: value,
        });
    }

    function resetForm() {
        setInputs(initial);
    }

    function clearForm() {
        const blankState = Object.fromEntries( 
        Object.entries(inputs).map(([key, value]) => [key, ''])
        );
        setInputs(blankState);
    }

    //return what needs to appear from the custom hook
    return {
        inputs,
        handleChange,
        resetForm,
        clearForm
    };
}