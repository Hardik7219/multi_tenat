'use client'
import { signupUser } from '@/services/auth.service'
import React from 'react'
const click=async ()=>{
    await signupUser({username:"harik7219",email:"email@ex.com",password:"hello7219"});
}
function SignupForm() {
  return (
    <div>
      <button onClick={click}>hello</button>
    </div>
  )
}

export default SignupForm
