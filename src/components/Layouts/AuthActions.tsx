import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { Provider } from "@/components";

import { AuthType, AuthTypes } from "@/types/account";

interface Props {
  session: Session | null;
  hidePostAuth?: boolean;
}

export const AuthActions = ({
  session = null,
  hidePostAuth = false,
}: Props) => {
  const isAuth = !!session;

  const router = useRouter();

  const handleSignOut = () => signOut();

  const handlePreAuth = (authType: AuthType = AuthTypes[0]) => {
    if (isAuth) return;
    router.push(
      {
        pathname: `/account/${authType}`,
      },
      undefined,
      { scroll: true }
    );
  };

  return !isAuth ? (
    <Provider.RenderGuard renderIf={!!AuthTypes.length}>
      {AuthTypes.map((type, idx) => (
        <Button
          key={`authAction-${type}`}
          variant={idx % 2 === 0 ? "subtle" : "filled"}
          onClick={() => handlePreAuth(type)}
          tt="capitalize"
        >
          {type.replace(/([A-Z])/g, " $1").trim()}
        </Button>
      ))}
    </Provider.RenderGuard>
  ) : !hidePostAuth ? (
    <Button
      variant="subtle"
      onClick={handleSignOut}
      tt="capitalize"
    >
      Sign Out
    </Button>
  ) : null;
};

export default AuthActions;
