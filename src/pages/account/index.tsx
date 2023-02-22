import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { Layout, Provider } from "@/components";

const AccountPage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  //#endregion  //*======== Pre-Render Checks ===========
  useEffect(() => {
    if (!isAuth) {
      router.replace("/account/signIn");
      return;
    }
  }, [isAuth, router]);

  //#endregion  //*======== Pre-Render Checks ===========

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isAuth}>
        <div>AccountPage</div>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountPage;
