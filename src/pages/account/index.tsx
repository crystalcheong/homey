import { Box, Flex, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { useAccountStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import { AccountMenulist } from "@/components/Layouts/Navbars/Base";

const AccountPage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
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
        <Flex direction="column">
          {AccountMenulist.map((item) => (
            <Box
              key={`accMenu-${item.label}`}
              component={Link}
              href={item.href || "#"}
              {...(!!item.onClick && {
                onClick: item.onClick,
              })}
            >
              {!!item.icon && (
                <item.icon
                  size={14}
                  color={theme.fn.primaryColor()}
                />
              )}
              {item.label}
            </Box>
          ))}
        </Flex>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountPage;
