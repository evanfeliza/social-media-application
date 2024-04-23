import React from 'react'

const EventsLayout
    = async ({
        children,
    }: {
        children: React.ReactNode;
    }) => {

        return (
            <div className="h-full bg-base-100 p-2">
                {children}
            </div>
        )
    }

export default EventsLayout