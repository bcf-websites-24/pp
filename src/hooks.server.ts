

export async function handleError({ error, event, status, message }) {
    return {
        message: message,
    };
}