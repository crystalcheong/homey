import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { Layout, Provider } from "@/components";

const AccountSavedPage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  //#endregion  //*======== Pre-Render Checks ===========
  useEffect(() => {
    if (!isAuth) {
      router.replace("/");
      return;
    }
  }, [isAuth, router]);

  //#endregion  //*======== Pre-Render Checks ===========

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isAuth}>
        <div>AccountSavedPage</div>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountSavedPage;
