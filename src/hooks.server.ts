import type { Handle, HandleServerError } from "@sveltejs/kit";
// import { RetryAfterRateLimiter } from "sveltekit-rate-limiter/server";

// const limiter = new RetryAfterRateLimiter({
//   IP: [30, "m"],
//   IPUA: [30, "m"],
// });

export const handleError: HandleServerError = async ({
  error,
  event,
  status,
  message,
}) => {
  return {
    message: error.message ?? message,
  };
};

// export const handle: Handle = async ({ event, resolve }) => {
//   const status = await limiter.check(event);
//   if (status.limited) {
//     let response = new Response(
//       `You are being rate limited. Please try after ${status.retryAfter} seconds.`,
//       {
//         status: 429,
//         headers: { "Retry-After": status.retryAfter.toString() },
//       }
//     );
//     return response;
//   }
//   const response = await resolve(event);
//   return response;
// };
