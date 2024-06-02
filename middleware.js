// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  // Example: Set a cookie
  response.cookies.set("example", "value", { path: "/", httpOnly: true });
  return response;
}
