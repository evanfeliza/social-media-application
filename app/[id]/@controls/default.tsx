"use client"
import React, { useEffect } from 'react'

import SidebarControls from '@/components/libs/sidebar'
import QueryProvider, { useQueryClient } from '@/components/providers/query-provider'



const ControlsSection = () => {
    const queryClient = useQueryClient()

    useEffect(() => {
        queryClient.refetchQueries({
            queryKey: ['profileInfo']
        })
    }, [queryClient])
    return (
        <QueryProvider>
            <SidebarControls />
        </QueryProvider>
    )
}

export default ControlsSection
