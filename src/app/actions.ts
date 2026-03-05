"use server";

import { headers } from "next/headers";

export async function sendAddToCartEvent(productName: string, price: number, clientUserAgent: string) {
  const pixelId = "2083660338863687";
  const accessToken = "EAATBK0wejPwBQ1OuN214rxrE7ZCkmJA6hx26kMvi2E1hzZB1SFpWaEwkMyRPf9GyEYsqq3IIu47rPIjvN7zCweJdPMMCChHwBxorqgQsZAGk0KM2VAaZAg7w4zAXhbGMPUkZCLxZCB6YspTwcZCP82dxViRN1yZARWBxRFuHvoRHCMsrqlQGEPKf4qvgZBZBzuxpbSyAZDZD";
  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "";
  const userAgent = clientUserAgent || headerStore.get("user-agent") || "";

  const eventData = {
    data: [
      {
        event_name: "AddToCart",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: {
          client_ip_address: ipAddress,
          client_user_agent: userAgent,
        },
        custom_data: {
          content_name: productName,
          value: price,
          currency: "IDR"
        }
      }
    ],
    test_event_code: "TEST64429"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventData)
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("CAPI Error:", error);
    return null;
  }
}
