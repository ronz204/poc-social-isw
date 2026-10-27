import { Html } from "@elysia/html";

// The last-resort page: no detail of the failure reaches the visitor.
export const ErrorView = () => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Happy</title>
      <link rel="stylesheet" href="/public/css/app.css" />
    </head>
    <body class="flex min-h-dvh items-center justify-center bg-slate-100 p-4 text-slate-900">
      <div class="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 class="text-xl font-bold">Something went wrong</h1>
        <p class="mt-2 text-slate-600">Please try again in a moment.</p>
      </div>
    </body>
  </html>
);
