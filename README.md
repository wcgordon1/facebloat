<h1 align="center">
  Convex SaaS
</h1>

<div align="center">
  <p>
  A production-ready Convex Stack for your next SaaS application with Stripe integration, TanStack, Resend, Tailwindcss, and shadcn.
  </p>
</div>

<div align="center">
    <a href="https://convex-saas.netlify.app">Live Demo</a> |  <a href="https://github.com/get-convex/convex-saas/tree/main/docs">Documentation</a>
  <div align="center"><br>
  <a href="https://labs.convex.dev/convex-saas"> <img src="https://github.com/get-convex/convex-saas/blob/v1markchanges/public/images/convexsaas.png" alt="convex saas" /></a>
</div>
   
  </p>
</div>

# Features

Features provided out of the box:

- 🧩 **Convex**: A complete, reactive, typesafe backend with authentication and file storage.
- ⚡ **Vite**: Next-Gen Frontend Tooling.
- 🛍️ **Stripe**: Subscription Plans, Customer Portal, and more.
- 🔑 **Authentication**: Email Code and Social Logins.
- 🎨 **TailwindCSS**: Utility-First CSS Framework.
- 📐 **ShadCN**: Composable React components.
- 🌙 **Easy Theming**: Switch between Light and Dark modes with ease.
- 🗺️ **TanStack Router**: Simple Route Definitions.
- 📧 **Resend**: Email for Developers.
- 💌 **React Email**: Customizable Emails with React.
- 📋 **Conform**: Type-Safe Form Validation based on Web Fundamentals.
- 📥 **File Uploads**: Profile Picture Uploads with Convex.
- 🌐 **I18N**: Internationalization for your App.
- 🧰 **TanStack Development Tools**: Enhanced Development Experience.
- 💅 **Modern UI**: Carefully crafted UI with a Modern Design System.
- 🏕 **Custom Pages**: Landing, Onboarding, Dashboard and Admin Pages.
- 📱 **Responsive**: Works on all devices, from Mobile to Desktop.
-

## [Live Demo](https://convex-saas.netlify.app)

> [!NOTE]
> Convex SaaS is an Open Source Template that is a direct port of the amazing
> work of [Daniel Kanem](https://twitter.com/DanielKanem) in [Remix SaaS](https://github.com/dev-xo/remix-saas).
> As that template does, this one shares common bits of code with: [Indie
> Stack](https://github.com/remix-run/indie-stack), [Epic
> Stack](https://github.com/epicweb-dev/epic-stack), [Supa Stripe
> Stack](https://github.com/rphlmr/supa-stripe-stack), and some other amazing
> Open Source resources. Check them out, please!

## Getting Started

Check out the [Getting Started Documentation](https://github.com/get-convex/convex-saas/tree/main/docs) to get up
and running.

# Clerk Auth Environment Variables

## Frontend (.env.local for dev, production env for prod)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_dev_key_here # (dev)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_prod_key_here # (prod)
```

## Convex Backend (set via CLI)

### Development
```
npx convex env set CLERK_SECRET_KEY sk_test_your_dev_secret_here
```

### Production
```
npx convex env --prod set CLERK_SECRET_KEY sk_live_your_prod_secret_here
```

- Get your keys from the Clerk dashboard: https://dashboard.clerk.com/
- The publishable key is for the frontend, the secret key is for backend JWT verification (optional, but recommended for protected Convex functions).
