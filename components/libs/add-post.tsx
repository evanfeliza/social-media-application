"use client"
import React, { ChangeEvent, memo, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Avatar from './avatar'
import { Modal } from './modal'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'


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


const getPostImageFole = (e: React.ChangeEvent<HTMLInputElement>): File | undefined => {
    const file = e.target.files?.[0];
    return file;
};

const useAddPostModal = () => {
    const params = useParams()
    const queryClient = useQueryClient()
    const supabase = createClient()
    const { data } = useAddPostForm()
    const { register, reset, formState: { errors }, handleSubmit, watch, control } = useFormContext<PostFormData>()
    const addPostModalRef = useRef<HTMLDialogElement>(null)
    const [previewImagePost, setPreviewImagePost] = useState<string | null>(null);
    const [postImageFile, setPostImageFile] = useState<File | null>()
    const postValue = watch('post')



    const mutation = useMutation({
        mutationFn: async (formData: {
            post: string;
            postImageUrl: string
        }) => {
            const filename = `${params?.id}-${Date.now()}-${postImageFile?.name}`

            if (postImageFile) {
                const { data: postImageUrl } = await supabase.storage
                    .from('image-post')
                    .upload(filename, postImageFile, {
                        cacheControl: "3600",
                        upsert: false,
                    })
                if (postImageUrl) {
                    const { data: signedPostImageUrl } = await supabase.storage
                        .from('image-post')
                        .createSignedUrl(filename, 3600)

                    return await supabase
                        .from('posts')
                        .insert([
                            { user_id: data?.id, post: formData.post, image_post: signedPostImageUrl?.signedUrl },
                        ])
                        .select()
                }



            } else {
                return await supabase
                    .from('posts')
                    .insert([
                        { user_id: data?.id, post: formData.post },
                    ])
                    .select()
            }

        },
    })

    const onSubmitAddPost = (formData: {
        post: string;
        postImageUrl: string
    }) => {
        mutation.mutate(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['posts'] })
                toast.success(`Post Added`, { className: "capitalize tracking-widest text-xs" })
                reset()
                setPostImageFile(null)
                addPostModalRef?.current?.close()
            },

            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })

    };

    const postImageUrl = watch('postImageUrl')
    const handlePreviewImagePost = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log(file)
        const reader = new FileReader();


        reader.onload = (event: ProgressEvent<FileReader>) => {
            const dataUrl = event.target?.result as string;
            setPreviewImagePost(dataUrl);
        };

        if (file) {
            reader.readAsDataURL(file);
            setPostImageFile(file)
        }
    };




    return {
        modal:
            <Modal onBackdropClick={() => {
                addPostModalRef?.current?.close()
                setPreviewImagePost(null)
                reset()

            }} ref={addPostModalRef}
                modalBoxClassName="!max-w-[40rem]"
            >
                <div className='mb-5'>
                    <h1 className="text-md tracking-wider font-medium text-center">Add a Post</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmitAddPost)}>
                    <label className="form-control w-full col-span-12">
                        <div className="label sr-only">
                            <span className="label-text">Post</span>
                        </div>
                        <textarea
                            className="textarea textarea-bordered textarea-sm resize-none"
                            {...register("post")}
                            placeholder={`Share your moments here! ${data?.user_metadata.display_name}`}
                        ></textarea>
                        {errors?.post && <span className="text-red-500"></span>}
                    </label>
                    <label className="form-control w-full col-span-12 mt-2">
                        <div className="label sr-only">
                            <span className="label-text">Post Image</span>
                        </div>
                        <Controller
                            control={control}
                            name="postImageUrl"
                            render={({ field: { onChange, value } }) => (
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        onChange(e);
                                        handlePreviewImagePost(e);
                                    }}
                                    accept='image/*'
                                    value={value}
                                    className="file-input file-input-bordered file-input-sm w-full max-w-xs"
                                />
                            )}

                        />
                        {previewImagePost && (
                            <div className="mt-4 relative w-full">
                                <Image
                                    src={previewImagePost}
                                    alt="Preview Image Post"
                                    width={500}
                                    height={500}
                                    className=' rounded-lg mx-auto'
                                />
                                <button className="absolute top-2 right-2 btn btn-circle btn-xs btn-ghost btn-outline" onClick={(e) => {
                                    e.preventDefault()
                                    setPreviewImagePost(null)
                                    reset({ postImageUrl: "" })
                                }}>
                                    <i className="fi fi-rr-cross-small "></i>
                                </button>
                            </div>
                        )}

                        {errors?.postImageUrl && <span className="text-red-500"></span>}
                    </label>

                    <div className="modal-action col-span-12 ">
                        <button type="submit" className={`btn btn-block ${(!postImageUrl?.length && !postValue) && 'btn-disabled'} btn-success btn-sm tracking-widest font-light`}>{mutation.isPending ? <span className="loading loading-spinner loading-sm text-primary"></span> : "Post"}</button>
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