'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {signIn, useSession} from 'next-auth/react'

const LoginPage = () => {
  
  const [error, setError] = useState("")
  const router = useRouter()

  // const session = useSession();
  const {data: session, status: sessionStatus} = useSession()

  useEffect(()=> {
    if(sessionStatus === "authenticated"){
      router.replace("/dashboard")
    }
  }, [sessionStatus, router])

  const isValidEmail = (email: string) => {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return emailRegex.test(email)
  }

  const handleSubmit = async (e:any) => {
      e.preventDefault();
      const email = e.target[0].value;
      const password = e.target[1].value;

      if(!isValidEmail(email)){
          setError("Email is invalid")
          return
      }

      console.log(password);
      
      if(!password || password.length < 8){
          console.log("error pass len < 8");
          
          setError("Password is invalid")
          return
      }

      const res = await signIn("creadentials",{
        redirect: false,
        email,
        password
      })

      if(res?.error){
        setError("Invalid email or password")
        if(res?.url){
          router.replace("/dashboard")
        }else{
          setError("")
        }
      }
  }

  if(sessionStatus === 'loading'){
    return <h1>Loading...</h1>
  }

  return (
  
  sessionStatus !== 'authenticated' && (<div className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='p-8 rounded shadow-md 2-96'>
          <h1 className='text-4xl text-center font-semibold mb-8'>Login</h1>
          <form onSubmit={handleSubmit}>
              <p className='text-red-500 text-[16px] mb-4'>{error}</p>
              <input type="text" className='w-full border border-gray-300 text-black rounded px-3 py-2 mb-3 focus:border-blue-400 focus:text-black'
                  placeholder='test@example.com'
                  required
              />
              <input type="password" className='w-full border border-gray-300 text-black rounded px-3 py-2 mb-3 focus:border-blue-400 focus:text-black'
                  placeholder='Password'
                  required
              />
              <button type='submit' className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'>Login</button>
          </form>
          <button className='w-full bg-black text-white py-2 my-2 rounded hover:bg-gray-800' onClick={() => {signIn("github")}}>Sign In with Github</button>
          <Link className='block text-center text-blue-500 hover:underline mt-2' href="/register">Register here</Link>
      
      </div>
  </div>)
)
}

export default LoginPage
