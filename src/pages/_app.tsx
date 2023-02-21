import {
  completeNavigationProgress,
  startNavigationProgress,
} from "@mantine/nprogress";
import { AppType } from "next/dist/shared/lib/utils";
import { useRouter } from "next/router";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

import "@/styles/globals.css";

import { Provider } from "@/components";

import { api } from "@/utils/api";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const start = (url: string) => {
      if (url === router.asPath) return;
      setLoading(true);
      startNavigationProgress();
    };
    const end = () => {
      setLoading(false);
      completeNavigationProgress();
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  return (
    <SessionProvider session={session}>
      <Provider.Mantine>
        <Provider.ErrorBoundary>
          <Provider.RenderGuard renderIf={!loading}>
            <Component {...pageProps} />
          </Provider.RenderGuard>
        </Provider.ErrorBoundary>
      </Provider.Mantine>
    </SessionProvider>
  );
};

export default api.withTRPC(App);
