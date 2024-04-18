"use client"
import React, { useContext, useEffect, useRef } from 'react'
import { Modal } from './modal'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PostContext } from '../providers/post-provider'


type PostFormData = {
    id: string;
    created_at: string;
    email: string;
    display_name: string;
    post: string;
    postImageUrl: string;
    is_liked_user_id: string[]
}




const useEditPostModal = () => {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const { register, reset, formState: { errors }, handleSubmit, watch } = useFormContext<PostFormData>()
    const editPostModalRef = useRef<HTMLDialogElement>(null)
    const postValue = watch('post')

    const mutationUpdatePost = useMutation({
        mutationFn: async (formData: PostFormData) => {
            return await supabase
                .from('posts')
                .update({ post: formData.post })
                .eq('id', formData.id)
                .select()
        },
    })

    const onSubmitUpdatePost = (formData: PostFormData) => {
        mutationUpdatePost.mutate(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['posts'] })
                toast.success(`Post Update`, { className: "capitalize tracking-widest text-xs" })
                reset()
                editPostModalRef?.current?.close()
            },

            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })

    };


    return {
        modal:
            <Modal onBackdropClick={() => {
                editPostModalRef?.current?.close()
                reset()
            }} ref={editPostModalRef}
            >
                <div className='mb-5'>
                    <h1 className="text-md tracking-wider font-medium text-center">Your Post</h1>
                </div>
                <form onSubmit={handleSubmit(onSubmitUpdatePost)}>
                    <label className="form-control w-full col-span-12">
                        <div className="label sr-only">
                            <span className="label-text">Post</span>
                        </div>
                        <textarea className="textarea textarea-bordered textarea-sm resize-none"
                            {...register('post', { required: true })}
                        ></textarea>
                        {errors?.post && <span className="text-red-500"></span>}
                    </label>

                    <div className="modal-action col-span-12 ">
                        <button type="submit" className={`btn btn-block ${postValue?.length === 0 && 'btn-disabled'} btn-success btn-sm tracking-widest font-light`}>{mutationUpdatePost.isPending ? <span className="loading loading-spinner loading-sm text-primary"></span> : "Update"}</button>
                    </div>
                </form>
            </Modal >
        ,
        open: () => {
            editPostModalRef?.current?.showModal()
        },
    }
}

const useDeletePostModal = () => {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const { reset, handleSubmit } = useFormContext<PostFormData>()
    const deletePostModalRef = useRef<HTMLDialogElement>(null)

    const mutationDeletePost = useMutation({
        mutationFn: async (formData: PostFormData) => {
            return await supabase
                .from('posts')
                .delete()
                .eq('id', formData.id)
        },
    })

    const onSubmitDeletePost = (formData: PostFormData) => {
        mutationDeletePost.mutate(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['posts'] })
                toast.success(`Post Deleted`, { className: "capitalize tracking-widest text-xs" })
                reset()
                deletePostModalRef?.current?.close()
            },

            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })

    };


    return {
        modal:
            <Modal modalBoxClassName="flex flex-col gap-4" onBackdropClick={() => deletePostModalRef?.current?.close()} ref={deletePostModalRef}>
                <p className="modal-title"> Are you sure you want to delete this Post?</p>
                <div className="card-actions justify-end">
                    <button onClick={(e) => {
                        e.preventDefault();
                        reset()
                        deletePostModalRef?.current?.close()
                    }} className="btn btn-outline btn-xs w-1/4 btn-error tracking-widest font-light">No</button>
                    <button type="submit" onClick={handleSubmit(onSubmitDeletePost)} className="btn btn-outline btn-xs w-1/4 btn-success tracking-widest font-light">Yes</button>
                </div>
            </Modal >
        ,
        open: () => {
            deletePostModalRef?.current?.showModal()
        }
    }
}




const useEditPostForm = () => {
    const methods = useForm<PostFormData>()
    const post = useContext(PostContext)

    useEffect(() => {
        if (post) {
            methods.reset({
                id: post?.id,
                post: post?.post
            })
        }
    }, [methods, post])

    return {
        methods,
    }

}


const ManagePostMenu = () => {
    const { open: openEditPostModal, modal: editPostModal } = useEditPostModal()
    const { open: openDeletePostModal, modal: deletePostModal } = useDeletePostModal()

    return (<div className="dropdown dropdown-end">
        {editPostModal}
        {deletePostModal}
        <div tabIndex={0} role="button" className="btn btn-xs btn-circle btn-ghost"><i className="fi fi-br-menu-dots-vertical"></i></div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li >
                <a onClick={openEditPostModal} >Edit</a>
            </li>
            <li><a onClick={openDeletePostModal}>Delete</a></li>
        </ul>
    </div>)
}


const ManagePost = () => {
    const { methods } = useEditPostForm()

    return (
        <>
            <FormProvider {...methods}>
                <ManagePostMenu />
            </FormProvider>
        </>

    )
}

export default ManagePost