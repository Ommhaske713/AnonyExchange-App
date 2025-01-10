import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schema/signUpSchema"

const page = () => {
  const [username,setUsername] = useState('')
  const [usernameMessage,setUsernameMessage] = useState('')
  const [isCheckingUsername,setIsCheckingUsername] = useState('')
  const debouncedUsername = useDebounce(username,500)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email:'',
      password:''
    }
  })
  useEffect(()=>{
  
  },[debouncedUsername])
  return (
    <div>
      <h1>Hello testing</h1>
      <button className='bg-orange-500 border-spacing-1' >signIn</button>
    </div>
  )
}

export default page
