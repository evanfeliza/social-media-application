"use client"
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { submitSignInForm } from "./actions";
import { toast, Toaster } from 'sonner';
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginInFormData = {
    email: string;
    password: string;
};

const useLogin = () => {
    const router = useRouter()
    const methods = useForm<LoginInFormData>({
        shouldUseNativeValidation: true,
    });

    const onSubmit = async (formData: LoginInFormData) => {
        const { error, data } = await submitSignInForm({ formData })
        if (data) {
            router.push(`/${data}`)
        } else if (error) {
            toast.error(`${error}. Please try again.`, { className: "capitalize tracking-widest text-xs" })
        }
    }

    return {
        methods,
        handleSubmit: methods.handleSubmit(onSubmit),
    };
};

const LoginForm = () => {
    const { register, formState: { errors }, } = useFormContext<LoginInFormData>();


    return (
        <div className="flex flex-col items-center justify-center h-screen max-h-full px-4 py-3">
            <div className="card gap-4">
                <div className="card-title">
                    <h3 className="text-5xl tracking-widest uppercase font-bold mx-auto flex-none">Login</h3>
                </div>
                <p className="flex-none text-sm tracking-wider">Please enter your email and password to access the application.</p>
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
                    {errors?.email && <p className="text-xs text-warning mt-1 "><i className="fi fi-sr-info mr-1"></i>{errors.email?.message}</p>}
                </div>
                <div className="w-full">
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
                <p className='text-sm text-right '>You don't have an account?<Link href={`/signup`} className=' ml-2 btn-link'>Sign Up here!</Link></p>
            </div>

        </div>
    );
};
const LoginDetails = () => {
    const { methods, handleSubmit } = useLogin();

    return (
        <FormProvider {...methods}>
            <Toaster
                position="top-center"
                richColors
            />
            <form noValidate onSubmit={handleSubmit}>
                <LoginForm />
            </form>
        </FormProvider>
    );
};

export default LoginDetails;
