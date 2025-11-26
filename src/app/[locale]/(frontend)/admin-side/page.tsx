"use client"
import React from 'react'
import Link from 'next/link'
const page = () => {
  return (
    <div className='flex justify-center items-center h-screen gap-3'>
        <Link href={'/instructor/my-courses'} className='hover:font-bold border border-gray-600 p-3 rounded '>My Courses</Link>
        <Link href={'/instructor/create-course'} className='hover:font-bold border border-gray-600 p-3 rounded '>Create Course</Link>
        <Link href={'/instructor/edit-course'} className='hover:font-bold border border-gray-600 p-3 rounded '>Edit Course</Link>
        <Link href={'/instructor/my-courses'} className='hover:font-bold border border-gray-600 p-3 rounded '>My Courses</Link>
        <Link href={'/admin/dashboard'} className='hover:font-bold border border-gray-600 p-3 rounded '>Admin</Link>
        <Link href={'/course-detail/1231312'} className='hover:font-bold border border-gray-600 p-3 rounded '>Course Detail</Link>
    </div>
  )
}

export default page;