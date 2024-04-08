"use client"
import React from 'react'
import Link from 'next/link';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { submitSignupForm } from './actions';

type SignUpFormData = {
    email: string;
    password: string;
    displayName: string;
};


const useSignUp = () => {
    const methods = useForm<SignUpFormData>({
        shouldUseNativeValidation: true,
    });

    const onSubmit = async (formData: SignUpFormData) => {
        try {
            const res = await submitSignupForm(formData)
            if (res) {
                toast.success(`You have Successfully signed up!`, { className: "capitalize tracking-widest text-xs" })
                methods.reset()
            } else {
                throw new Error(res as string)
            }
        } catch (error) {
            toast.error(`${error}`, { className: "capitalize tracking-widest text-xs" })
        }

    }

    return {
        methods,
        handleSubmit: methods.handleSubmit(onSubmit),
    };
};

const SignUpForm = () => {
    const { register, formState: { errors }, } = useFormContext<SignUpFormData>();
    return (
        <div className="flex flex-col items-center justify-center h-screen max-h-screen">
            <div className="card gap-2 w-1/3">
                <h3 className="text-5xl tracking-widest uppercase font-bold mx-auto flex-none">Sign Up</h3>
                <p className="flex-none text-sm tracking-wider">Please fill the required fields.</p>
                <div className='w-full'>
                    <label htmlFor="displayName" className='join w-full'>
                        <div className="join-item btn btn-disabled btn-accent">
                            <i className="fi fi-rr-id-badge"></i>
                        </div>
                        <input
                            placeholder="Juan Dela Cruz"
                            type="text"
                            autoComplete="off"
                            className="input input-bordered join-item w-full"
                            {...register("displayName", { required: "Display Name is required" })}
                        />
                    </label>
                    {errors?.displayName && <p className="text-xs text-warning mt-1"><i className="fi fi-sr-info mr-1"></i>{errors.displayName?.message}</p>}
                </div>
                <div className="w-full">
                    <label htmlFor="email" className='join w-full'>
                        <div className="join-item btn btn-disabled btn-accent">
                            <i className="fi fi-br-at"></i>
                        </div>
                        <input
                            placeholder="Email"
                            type="email"
                            autoComplete="off"
                            className="input input-bordered join-item w-full"
                            {...register("email", {
                                required: "Email is required", pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: `This is not a valid email address`
                                }
                            })}
                        />
                    </label>
                    {errors?.email && <p className="text-xs text-warning mt-1"><i className="fi fi-sr-info mr-1"></i>{errors.email?.message}</p>}
                </div>
                <div className='w-full'>
                    <label htmlFor="password" className='join w-full'>
                        <div className="join-item btn btn-disabled btn-accent">
                            <i className="fi fi-rr-lock"></i>
                        </div>
                        <input
                            placeholder="Password"
                            type="password"
                            autoComplete="off"
                            className="input input-bordered join-item w-full"
                            {...register("password", { required: "Password is required" })}
                        />
                    </label>
                    {errors?.password && <p className="text-xs text-warning mt-1"><i className="fi fi-sr-info mr-1"></i>{errors.password?.message}</p>}
                </div>

                <input type="submit" className="btn btm-nav-sm btn-outline btn-accent uppercase tracking-widest text-accent-content" />
                <p className='text-sm text-right'>Already have an account?<Link href={`/login`} className=' ml-2 btn-link'>Login</Link></p>
            </div>
        </div>
    );
};

const SignUpDetails = () => {
    const { methods, handleSubmit } = useSignUp();


    return (
        <FormProvider {...methods}>
            <Toaster
                position="top-right"
                reverseOrder={true}
            />
            <form noValidate onSubmit={handleSubmit}>
                <SignUpForm />
            </form>
        </FormProvider>
    );
}

export default SignUpDetails