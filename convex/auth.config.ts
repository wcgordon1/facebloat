const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing CONVEX_URL environment variable");
}
const domain = new URL(convexUrl).origin;

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
};
