import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { googleAuth, loginUser, validUser } from '../apis/auth'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode" // Corrected import
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs"

const defaultData = { email: "", password: "" }

function Login() {
  const [formData, setFormData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const pageRoute = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.email.includes("@") && formData.password.length > 6) {
      setIsLoading(true)
      try {
        const { data } = await loginUser(formData)
        if (data?.token) {
          localStorage.setItem("userToken", data.token)
          toast.success("Successfully Logged In!")
          pageRoute("/chats")
        } else {
          toast.error("Invalid Credentials!")
        }
      } catch (err) {
        toast.error("Login failed!")
      }
      setIsLoading(false)
    } else {
      toast.warning("Enter valid email and password!")
      setFormData(defaultData)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential) // Using jwtDecode correctly
      setIsLoading(true)
      const { data } = await googleAuth({ tokenId: credentialResponse.credential })
      if (data.token) {
        localStorage.setItem("userToken", data.token)
        toast.success("Logged in with Google!")
        pageRoute("/chats")
      }
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      toast.error("Google login failed!")
    }
  }

  useEffect(() => {
    const checkValidUser = async () => {
      const data = await validUser()
      if (data?.user) window.location.href = "/chats"
    }
    checkValidUser()
  }, [])

  return (
    <div className='bg-[#121418] w-[100vw] h-[100vh] flex justify-center items-center'>
      <div className='w-[90%] sm:w-[400px] mt-20 relative'>
        <div className='absolute -top-5 left-0'>
          <h3 className='text-[25px] font-bold text-white'>Login</h3>
          <p className='text-white text-sm'>No Account? <Link className='text-green-400 underline' to="/register">Sign up</Link></p>
        </div>
        <form className='flex flex-col gap-y-3 mt-[12%]' onSubmit={handleSubmit}>
          <input className="bg-[#222] h-[50px] pl-3 text-white" onChange={handleChange} name="email" type="email" placeholder='Email' value={formData.email} required />
          <div className='relative'>
            <input className='bg-[#222] h-[50px] pl-3 text-white w-full' onChange={handleChange} type={showPass ? "text" : "password"} name="password" placeholder='Password' value={formData.password} required />
            <button type='button' onClick={() => setShowPass(!showPass)}>
              {!showPass ? <BsEmojiLaughing className='absolute top-3 right-5 text-white' /> : <BsEmojiExpressionless className='absolute top-3 right-5 text-white' />}
            </button>
          </div>
          <button type='submit' className='bg-gradient-to-r from-green-500 to-yellow-300 text-[#121418] font-bold h-[50px]'>
            {isLoading ? "Loading..." : "Login"}
          </button>
          <div className='text-center text-white'>or</div>
          <div className='w-full flex justify-center'>
            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => toast.error("Google Login Failed")} />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
