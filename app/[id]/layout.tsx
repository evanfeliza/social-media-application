import Navbar from '@/components/libs/navbar';
import React from 'react'

const DashboardLayout = async ({
    children,
    controls,
    events,
}: {
    children: React.ReactNode;
    controls: React.ReactNode;
    events: React.ReactNode
}) => {

    return (
        <div className="h-screen container mx-auto">
            <Navbar />
            <div className='h-full grid grid-cols-12 px-[0.5rem] gap-2'>
                <div className='h-full col-span-3'>
                    {controls}
                </div>
                <div className='h-full col-span-6'>
                    {children}
                </div>
                <div className='h-full col-span-3'>
                    {events}
                </div>
            </div>
        </div>

    )
}

export default DashboardLayout