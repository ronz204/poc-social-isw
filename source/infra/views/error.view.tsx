import { Html } from "@elysia/html";
import { FriendlyMessage } from "./components/friendly-message.component";
import { Head } from "./components/head.component";
import { Header } from "./components/header.component";

// The last-resort page: no detail of the failure reaches the visitor.
export const ErrorView = () => (
  <html lang="en">
    <Head />
    <body class="flex min-h-dvh flex-col">
      <Header connection={false} />
      <main class="flex flex-1 items-center justify-center p-4">
        <div class="max-w-sm">
          <FriendlyMessage icon="triangle-alert" text="Something went wrong. Please try again in a moment." />
        </div>
      </main>
    </body>
  </html>
);
