export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/batches/:path*",
    "/suppliers/:path*",
    "/products/:path*",
    "/settings/:path*",
  ],
};
