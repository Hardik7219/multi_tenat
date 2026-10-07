'use client'

import { useSession } from "next-auth/react"

function  page() {
  const { data: session } = useSession()
  return (
    <div>
    {session?.user?.email}
    </div>

  )
}

export default page
