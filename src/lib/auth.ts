import { headers } from "next/headers";

/**
 * Reads the identity the middleware already validated via getUser() and
 * forwarded as request headers. Only ever set by our own middleware after
 * verifying the session - never trust these headers outside that flow.
 */
export async function getAuthenticatedUser() {
  const headersList = await headers();
  const id = headersList.get("x-user-id");
  const email = headersList.get("x-user-email");

  if (!id) {
    return null;
  }

  return { id, email };
}
