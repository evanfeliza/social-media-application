import React, { createContext } from 'react'

type PostFormData = {
    id: string;
    created_at: string;
    email: string;
    display_name: string;
    post: string;
    image_post: string;
    is_liked_user_id: string[]
}



export const PostContext = createContext<PostFormData | null>(null)

const PostProvider = ({ post, children }: { post: PostFormData; children: React.ReactNode }) => {
    return (
        <PostContext.Provider value={post}>{children}</PostContext.Provider>
    )
}

export default PostProvider