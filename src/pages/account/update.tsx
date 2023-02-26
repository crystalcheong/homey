import { Title } from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { useAccountStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import BetaWarning from "@/components/Layouts/BetaWarning";

const AccountUpdatePage = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const currentUser = useAccountStore.use.currentUser();

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
      <Provider.RenderGuard renderIf={isAuth || !!currentUser}>
        <BetaWarning />

        <Title
          order={1}
          size="h3"
          sx={{
            wordBreak: "break-word",
          }}
        >
          Account Details
        </Title>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountUpdatePage;
