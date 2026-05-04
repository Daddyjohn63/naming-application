import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

export default function CatsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Cats</h1>
      <p className="text-muted-foreground text-sm">
        Add a cat profile to start the naming ceremony.
      </p>
      <Button asChild>
        <Link href="/dashboard/cats/new-cat">New cat</Link>
      </Button>
    </div>
  )
}
