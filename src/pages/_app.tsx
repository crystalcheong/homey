import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import "@/styles/globals.css";

import { Provider } from "@/components";

import { api } from "@/utils/api";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Provider.ErrorBoundary>
        <Component {...pageProps} />
      </Provider.ErrorBoundary>
    </SessionProvider>
  );
};

export default api.withTRPC(App);
