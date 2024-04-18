"use client"
import React, { useEffect, useRef } from 'react'
import Avatar from './avatar'
import { Modal } from './modal'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'


type PostFormData = {
    id: string;
    post: string;
    postImageUrl: string;
}

const getProfileInfo = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return user
}

const useAddPostModal = () => {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const { data } = useAddPostForm()
    const { register, reset, formState: { errors }, handleSubmit, watch } = useFormContext<PostFormData>()
    const addPostModalRef = useRef<HTMLDialogElement>(null)

    const postValue = watch('post')
    // const email = getValues("email")

    const mutation = useMutation({
        mutationFn: async (formData: { post: string }) => {
            return await supabase
                .from('posts')
                .insert([
                    { user_id: data?.id, post: formData.post },
                ])
                .select()
        },
    })

    const onSubmitAddPost = (formData: {
        post: string;
    }) => {
        mutation.mutate(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['posts'] })
                toast.success(`Post Added`, { className: "capitalize tracking-widest text-xs" })
                reset()
                addPostModalRef?.current?.close()
            },

            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })

    };


    return {
        modal:
            <Modal onBackdropClick={() => {
                addPostModalRef?.current?.close()
                reset()
            }} ref={addPostModalRef}

            >
                <div className='mb-5'>
                    <h1 className="text-md tracking-wider font-medium text-center">Add a Post</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmitAddPost)}>
                    <label className="form-control w-full col-span-12">
                        <div className="label sr-only">
                            <span className="label-text">Post</span>
                        </div>

                        <textarea className="textarea textarea-bordered textarea-sm resize-none"
                            placeholder={`Share your moments here! ${data?.user_metadata.display_name}`}
                            {...register('post', { required: true })}
                        ></textarea>
                        {errors?.post && <span className="text-red-500"></span>}
                    </label>

                    <div className="modal-action col-span-12 ">
                        <button type="submit" className={`btn btn-block ${postValue?.length === 0 && 'btn-disabled'} btn-success btn-sm tracking-widest font-light`}>{mutation.isPending ? <span className="loading loading-spinner loading-sm text-primary"></span> : "Post"}</button>
                    </div>
                </form>
            </Modal >
        ,
        open: () => {
            addPostModalRef?.current?.showModal()
        },
    }
}
const useAddPostForm = () => {
    const methods = useForm<PostFormData>()
    const { data, isFetched } = useQuery({ queryKey: ['profileInfo'], queryFn: getProfileInfo })

    useEffect(() => {
        if (isFetched) {
            methods.reset({
                post: ""
            })
        }
    }, [methods])


    return {
        methods,
        data: data,
        isFetched: isFetched
    }

}

const AddPostForm = () => {
    const { watch } = useFormContext<PostFormData>()
    const { data, isFetched } = useAddPostForm()
    const { open: openAddPostModal, modal: addPostModal } = useAddPostModal()

    const postValue = watch("post")

    return <div className="px-3 py-2 w-full join gap-2 bg-base-300 rounded-box">
        {addPostModal}
        <div className="avatar join-item">
            {isFetched ? (<div className='rounded-full w-14'>
                <Avatar email={data?.email as string} />
            </div>) : <div className='rounded-full w-14 skeleton'>
            </div>}
        </div>
        <button onClick={openAddPostModal} className='join-item w-full'>
            <div className='btn btn-sm !justify-start input-bordered input-sm w-full ' >
                <span className='text-content text-xs font-light'>
                    {postValue?.length > 0 ? postValue : <>Share your moments here! <span className="capitalize">{data?.user_metadata.display_name}</span></>}
                </span>
            </div>
        </button>
    </div>
}


const AddPostButtonForm = () => {
    const { methods } = useAddPostForm()
    return (<FormProvider {...methods}>
        <AddPostForm />
    </FormProvider>

    )
}

export default AddPostButtonForm