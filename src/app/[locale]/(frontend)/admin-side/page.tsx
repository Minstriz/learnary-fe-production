"use client"
import React from 'react'
import Link from 'next/link'
const page = () => {
  return (
    <div className='flex justify-center items-center h-screen gap-3'>
        <Link href={'/instructor/my-courses'} className='hover:font-bold border border-gray-600 p-3 rounded '>My Courses</Link>
        <Link href={'/admin/dashboard'} className='hover:font-bold border border-gray-600 p-3 rounded '>Admin</Link>
    </div>
  )
}

export default page;