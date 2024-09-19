import type { HandleServerError } from "@sveltejs/kit";


export const handleError: HandleServerError = async ({ error, event, status, message }) => {
    return {
        message: error.message ?? message,
    };
}