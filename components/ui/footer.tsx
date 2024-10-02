'use client'
import Image from 'next/image'
import React, { useMemo } from 'react'


const Footer = () => {
    const list = useMemo(() => {
        const menu = [
            {
                id: '1',
                link: 'https://github.com/twinedo/ubersnap-x-twinedo',
                imageSrc: 'https://nextjs.org/icons/file.svg',
                title: 'Source'
            },
            {
                id: '2',
                link: 'https://twinedo.vercel.app/projects',
                imageSrc: 'https://nextjs.org/icons/window.svg',
                title: 'Projects'
            },
            {
                id: '3',
                link: 'https://ubersnap.com',
                imageSrc: 'https://nextjs.org/icons/globe.svg',
                title: 'Go to Ubersnap →'
            },
        ]
        return menu;
    }, [])

    return (
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
            {list?.map(item => (
                <a
                    key={item.id}
                    className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src={item.imageSrc}
                        alt="File icon"
                        width={16}
                        height={16}
                    />
                    {item.title}
                </a>
            ))}
        </footer>
    )
}

export default Footer