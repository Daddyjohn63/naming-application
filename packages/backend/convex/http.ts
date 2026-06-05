//HTTP router: Clerk webhook (/clerk-users-webhook) via Svix
//Clerk webhook is used to sync user data between Clerk and Convex
//Clerk webhook is triggered when a user is created, updated, or deleted
//Clerk webhook is triggered when a user's email address is updated
//Clerk webhook is triggered when a user's password is updated
//Clerk webhook is triggered when a user's profile picture is updated
//Clerk webhook is triggered when a user's username is updated
//Clerk webhook is triggered when a user's email address is verified
//Clerk webhook is triggered when a user's password is verified
//Clerk webhook is triggered when a user's profile picture is verified
import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"
import type { WebhookEvent } from "@clerk/backend"
import { Webhook } from "svix"

const http = httpRouter()

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request)
    if (!event) {
      return new Response("Error occurred", { status: 400 })
    }
    switch (event.type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        })
        break

      case "user.deleted": {
        const clerkUserId = event.data.id!
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId })
        break
      }
      default:
        console.log("Ignored Clerk webhook event", event.type)
    }

    return new Response(null, { status: 200 })
  }),
})

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text()
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  }
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent
  } catch (error) {
    console.error("Error verifying webhook event", error)
    return null
  }
}

export default http
