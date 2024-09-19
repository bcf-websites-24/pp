import { MAIL_OTP_ENDPOINT, MAIL_API_KEY } from "$env/static/private";
import fetch from "node-fetch";
import { other_error_logger_store } from "$lib/stores.server";
import { get } from "svelte/store";

// Helper function to delay execution
const delay = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getOTP(name: string, email: string) {
  const url = MAIL_OTP_ENDPOINT; // Endpoint from environment variable
  const apiKey = MAIL_API_KEY; // API key from environment variable

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    name: name,
    email: email,
  });

  const maxRetries = 3; // Maximum number of retry attempts
  let attempts = 0; // Track number of attempts

  while (attempts < maxRetries) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
      });
      let response_json: any = await response.json();

      // console.log(response_json);

      if (!response_json.otp || response_json.result.status !== "Succeeded") {
        throw new Error("Request failed: " + response_json.result.error);
      }

      return response_json.otp; // Exit function if successful
    } catch (error: any) {
      attempts++;

      get(other_error_logger_store).error(
        `Error sending otp verificaton mail for user: ${name}, mail: ${email}. (Attempt ${attempts}/${maxRetries}):`,
        error
      );

      if (attempts < maxRetries) {
        console.log(
          "Retrying in sending mail in 10 seconds for user: ${name}, mail: ${email} ..."
        );

        await delay(10000); // Wait for 10 seconds before retrying
      } else {
        throw new Error(
          `Failed after ${maxRetries} attempts: ${error.message} for user: ${name}, mail: ${email}`
        );
      }
    }
  }
}

// Call the function with name and email
// getOTP("test user", "aabaabaab489@gmail.com");
/**
 * output json format, I could not get it to fail anyway, 
 * so holding my balls and praying that errors are caught really
 * {
      otp: 5947,
      message: 'Email sent successfully!',
      result: {
        id: '5dc64873-c811-492e-b80b-74a00ee6d2af',
        status: 'Succeeded',
        error: null
      }
    }
 */
