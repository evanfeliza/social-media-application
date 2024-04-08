"use client "
import { Modal } from '@/components/libs/modal';
import { createClient } from '@/utils/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import Avatar from './avatar';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type ProfileFormData = {
    displayName: string,
    email: string;
    password: string;
}


const getProfileInfo = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return user
}





const useUpdateUserProfileModal = () => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const supabase = createClient()
    const { register, reset, formState: { errors }, getValues, handleSubmit } = useFormContext<ProfileFormData>()
    const updateUserProfileModalRef = useRef<HTMLDialogElement>(null)
    const email = getValues("email")

    const mutation = useMutation({
        mutationFn: async (data: { email: string; displayName: string }) => {
            await supabase.auth.updateUser({
                email: data.email,
                data: { displayName: data.displayName }
            })
        },
        onSettled: () => {
            return queryClient.invalidateQueries({ queryKey: ['profileInfo'] })
        },
        onSuccess: () => {
            return queryClient.invalidateQueries({ queryKey: ['profileInfo'] })
        },

    })

    const handleUpdateUserProfile = (formData: {
        displayName: string;
        email: string
    }) => {
        mutation.mutate(formData, {
            onSuccess: () => {
                toast.success(`Profile Updated!`, { className: "capitalize tracking-widest text-xs" })
                updateUserProfileModalRef?.current?.close()
                router.refresh()

                return queryClient.invalidateQueries({ queryKey: ['profileInfo'] })
            },
            onSettled: () => {
                return queryClient.invalidateQueries({ queryKey: ['profileInfo'] })
            },
            onError: (error) => toast.error(`${error}`, { className: "capitalize tracking-widest text-xs" })
        })
    };


    return {
        modal:
            <Modal onBackdropClick={() => {
                reset()
                updateUserProfileModalRef?.current?.close()
            }} ref={updateUserProfileModalRef}>
                <h1 className="text-lg tracking-wider font-bold mb-4">Update Profile</h1>
                <div className="grid grid-cols-12 gap-2">
                    <div className='col-span-12 mx-auto'>
                        <Avatar email={email} />
                    </div>
                    <label className="form-control w-full col-span-6">
                        <div className="label">
                            <span className="label-text">Display Name</span>
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
                        <input type="text" placeholder="Your Email Here" {...register("email", { required: "Field is empty." })} className="input input-bordered input-sm w-full max-w-xs" />
                        <div className="label">
                            {errors?.email && <p className="text-xs text-warning flex py-2 px-1 gap-2 items-center"><i className="fi fi-sr-info"></i>{errors.email?.message}</p>}
                        </div>
                    </label>
                    <div className="modal-action justify-end col-span-12">
                        <button onClick={(e) => {
                            e.preventDefault();
                            reset()
                            updateUserProfileModalRef?.current?.close()
                        }} className="btn btn-error btn-sm btn-outline tracking-widest font-light w-1/4">Cancel</button>
                        <button onClick={handleSubmit(handleUpdateUserProfile)} className="btn btn-success btn-sm btn-outline tracking-widest font-light w-1/4">Save</button>
                    </div>
                </div>
            </Modal >
        ,
        open: () => {
            updateUserProfileModalRef?.current?.showModal()
        },
    }
}

const useEditProfileForm = () => {
    const methods = useForm<ProfileFormData>()
    const { data } = useQuery({ queryKey: ['profileInfo'], queryFn: getProfileInfo })
    useEffect(() => {
        methods.reset({
            displayName: data?.user_metadata?.displayName,
            email: data?.email,
        })
    }, [methods, data])


    return {
        methods,
    }
}

const EditProfileForm = () => {
    const { open: openUpdateUserProfileModal, modal: updateUserProfileModal } = useUpdateUserProfileModal()

    return <>
        {updateUserProfileModal}
        <button onClick={(e) => {
            e.preventDefault()
            openUpdateUserProfileModal()
        }} className="btn btn-sm btn-outline btn-accent">
            <i className="fi fi-rs-pencil mr-4"></i>
            <span className='text-sm tracking-tight'>Edit Profile</span>
        </button>
    </>
}

const EditProfileButton = () => {
    const { methods } = useEditProfileForm()

    return (
        <FormProvider  {...methods}>
            <Toaster />
            <EditProfileForm />
        </FormProvider>
    )
}

export default EditProfileButton