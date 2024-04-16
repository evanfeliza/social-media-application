"use client "
import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/libs/modal';
import { createClient } from '@/utils/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import Avatar from './avatar';
import { toast, Toaster } from 'sonner';


type ProfileFormData = {
    displayName: string,
    email: string;
}


const getProfileInfo = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return user
}





const useUpdateUserProfileModal = () => {

    const queryClient = useQueryClient()
    const supabase = createClient()
    const [isUpdateEmail, setIsUpdateEmail] = useState(false)
    const { register, reset, formState: { errors }, getValues, handleSubmit } = useFormContext<ProfileFormData>()
    const updateUserProfileModalRef = useRef<HTMLDialogElement>(null)
    const email = getValues("email")

    const mutationUpdateUser = useMutation({
        mutationFn: (data: { displayName: string }) => {
            return supabase.auth.updateUser({
                data: {
                    display_name: data.displayName
                }
            })
        },
    })

    const mutationUpdateEmail = useMutation({
        mutationFn: (data: { email: string; }) => {
            return supabase.auth.updateUser({
                email: data.email
            })
        },
    })

    const handleUpdateEmail = (formData: {
        email: string
    }) => {
        mutationUpdateEmail.mutate(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profileInfo'] })
                toast.success(`A confirmation email has sent! Please confirm for verification`, { className: "capitalize tracking-widest text-xs" })

            },

            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })
    };

    const handleUpdateUserProfile = (formData: {
        displayName: string;
    }) => {
        mutationUpdateUser.mutate(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profileInfo'] })
                toast.success(`Profile Settings Updated`, { className: "capitalize tracking-widest text-xs" })

                updateUserProfileModalRef?.current?.close()
            },

            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })
    };


    return {
        modal:
            <Modal onBackdropClick={() => {
                reset()
                updateUserProfileModalRef?.current?.close()
            }} ref={updateUserProfileModalRef}>
                <form onSubmit={handleSubmit(handleUpdateUserProfile)}>
                    <h1 className="text-lg tracking-wider font-bold mb-4">Update Profile</h1>
                    <div className="grid grid-cols-12 gap-2">
                        <div className="avatar col-span-12">
                            <div className='rounded-full w-20 mx-auto'>
                                <Avatar email={email} />
                            </div>
                        </div>
                        <label className="form-control w-full col-span-6">
                            <div className="label">
                                <span className="label-text">Display Name *</span>
                            </div>
                            <input type="text" placeholder="Your Display Name Here" {...register("displayName", { required: "Field is empty." })} className="input input-bordered input-sm w-full max-w-xs" />
                            <div className="label">
                                {errors?.displayName && <p className="text-xs text-warning flex py-2 px-1 gap-2 items-center"><i className="fi fi-sr-info"></i>{errors.displayName?.message}</p>}
                            </div>
                        </label>
                        <label className="form-control w-full col-span-6">
                            <div className="label">
                                <span className="label-text">Email</span>
                            </div>
                            <div className='join'>
                                <input type="text" placeholder="Your Email Here" {...register("email", { required: "Field is empty." })} className="input input-bordered input-sm w-full max-w-lg join-item" disabled={!isUpdateEmail} />
                                <button className="btn btn-sm btn-active join-item " onClick={(e) => {
                                    e.preventDefault()
                                    setIsUpdateEmail(prevState => !prevState)
                                }}><i className="fi fi-rs-settings"></i></button>
                            </div>
                            <div className="label">
                                <div>{errors?.email && <p className="text-xs text-warning flex py-2 px-1 gap-2 items-center"><i className="fi fi-sr-info"></i>{errors.email?.message}</p>}</div>
                                {isUpdateEmail && <div className='join'>
                                    <button className="btn btn-sm btn-active btn-error join-item " onClick={(e) => {
                                        e.preventDefault()
                                        setIsUpdateEmail(false)
                                        reset()
                                    }}><i className="fi fi-rr-ban"></i></button>
                                    <button onClick={e => {
                                        e.stopPropagation()
                                        handleSubmit(handleUpdateEmail)(e)
                                        reset()
                                    }} className="btn btn-sm btn-active join-item btn-success">{mutationUpdateEmail.isPending ? <span className="loading loading-spinner loading-sm text-primary"></span> : <i className="fi fi-rs-check-circle"></i>}</button>
                                </div>}
                            </div>
                        </label>
                        <div className="modal-action justify-end col-span-12">
                            <button onClick={(e) => {
                                e.preventDefault();
                                reset()
                                updateUserProfileModalRef?.current?.close()
                            }} className="btn btn-error btn-sm btn-outline tracking-widest font-light w-1/4">Cancel</button>
                            <button type="submit" className="btn btn-success btn-sm tracking-widest font-light w-1/4">{mutationUpdateUser.isPending ? <span className="loading loading-spinner loading-sm text-primary"></span> : "Save"}</button>
                        </div>
                    </div>
                </form>
            </Modal >
        ,
        open: () => {
            updateUserProfileModalRef?.current?.showModal()
        },
    }
}

const useEditProfileForm = () => {
    const methods = useForm<ProfileFormData>()
    const { data, isFetched } = useQuery({ queryKey: ['profileInfo'], queryFn: getProfileInfo })
    useEffect(() => {
        if (isFetched) {
            methods.reset({
                displayName: data?.user_metadata?.display_name,
                email: data?.email
            })
        }
    }, [methods, data])


    return {
        methods,
    }
}

const EditProfileForm = () => {
    const { open: openUpdateUserProfileModal, modal: updateUserProfileModal } = useUpdateUserProfileModal()

    return <>
        {updateUserProfileModal}
        <Toaster
            position='bottom-right'
            richColors />
        <button onClick={(e) => {
            e.preventDefault()
            openUpdateUserProfileModal()
        }} className="btn btn-sm btn-accent  btn-outline">
            <i className="fi fi-rs-pencil"></i>
            <span className='text-xs tracking-tight'>Edit Profile</span>
        </button>
    </>
}

const EditProfileButton = () => {
    const { methods } = useEditProfileForm()

    return (
        <FormProvider  {...methods}>
            <EditProfileForm />
        </FormProvider>
    )
}

export default EditProfileButton

