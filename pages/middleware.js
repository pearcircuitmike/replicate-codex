// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  const currentTime = new Date().getTime();
  const currentMonth = new Date().getMonth();

  // Get the count and timestamp from the request cookies
  const count = parseInt(request.cookies.get("visitCount") || "0", 10);
  const timestamp = parseInt(request.cookies.get("visitTimestamp") || "0", 10);

  // Check if the current month is different from the stored timestamp month
  if (
    currentTime - timestamp > 30 * 24 * 60 * 60 * 1000 ||
    new Date(timestamp).getMonth() !== currentMonth
  ) {
    // Reset the count and timestamp for the new month
    response.cookies.set("visitCount", "1");
    response.cookies.set("visitTimestamp", currentTime.toString());
  } else {
    // Increment the count
    response.cookies.set("visitCount", (count + 1).toString());
  }

  // Check if the user is authenticated or if the count is within the limit
  if (request.cookies.get("isAuthenticated") || count < 5) {
    return response;
  }

  // Redirect to the login page if the limit is exceeded
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/papers/:path*", "/models/:path*"],
};
