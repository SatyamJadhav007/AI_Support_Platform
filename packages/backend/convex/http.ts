import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { internal } from "./_generated/api";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
});
const http = httpRouter();
// request from clerk => convex.deployment.site/clerk-webhook
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);

    if (!event) {
      //if the event is null that means the request was not valid
      return new Response("Error occurred", { status: 400 });
    }

    //action=>subscription-update;
    // OrgId check =>inc. maxAllowedMemberships for that org=> DB update of the status
    switch (event.type) {
      case "subscription.updated": {
        const subscription = event.data as {
          status: string;
          payer?: {
            organization_id: string;
          };
        };

        const organizationId = subscription.payer?.organization_id;

        if (!organizationId) {
          return new Response("Missing organiation Id");
        }

        const newMaxAllowedMemberships =
          subscription.status === "active" ? 5 : 1;
        await clerkClient.organizations.updateOrganization(organizationId, {
          maxAllowedMemberships: newMaxAllowedMemberships,
        });

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId,
          status: subscription.status,
        });

        break;
      }
      default:
        console.log("Ignored Clerk webhook event:", event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

// Verifying if the request is valid or not...
async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error Verifying webhook event:", error);
    return null;
  }
}

export default http;
