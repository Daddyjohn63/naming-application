"use client"
import { Button } from "@workspace/ui/components/button"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"

export default function Page() {
  const users = useQuery(api.users.getMany)
  const addUser = useMutation(api.users.add)
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Apps Web Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
      <Button onClick={() => addUser()}>Add User</Button>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}
