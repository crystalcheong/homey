import { Alert, Button, Container, Text, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { DefaultErrorShape } from "@trpc/server";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  TbAlertCircle,
  TbCircleCheckFilled,
  TbCircleXFilled,
} from "react-icons/tb";

import { Layout, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";
import { PasswordFormState } from "@/components/Pages/Auth";
import AuthPassword from "@/components/Pages/Auth/AuthPassword";

import { AuthTypes, validateAuthInput } from "@/pages/account/[auth]";
import {
  api,
  getPartialClonedObject,
  getReplacedStringDelimiter,
  logger,
} from "@/utils";

import EmptyNotifications from "~/assets/images/empty-notifications.svg";

const InitalFormState: Record<string, string> = {
  password: "",
  confirmPassword: "",
};

const FormErrorMessages: {
  [key in keyof typeof InitalFormState]: string;
} = {
  password: "Invalid Password",
  confirmPassword: "Passwords do not match",
};

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { data: sessionData, status: sessionStatus } = useSession();

  const { id, access_token } = router.query;
  const isAuth = !!sessionData;
  const isAuthLoading: boolean = sessionStatus === "loading";
  const isDark: boolean = theme.colorScheme === "dark";

  const paramId: string = (id ?? "").toString();
  const paramAccessToken: string = (access_token ?? "").toString();

  useEffect(() => {
    const rawHref: string = router.asPath;
    const isMalformed: boolean = rawHref.includes("#");

    if (isMalformed) {
      const fixedHref = `${
        window?.location?.origin ?? ""
      }${getReplacedStringDelimiter(rawHref, `#`, `&`)}`;
      const url: URL = new URL(fixedHref);
      router.replace(url);

      logger("reset-password.tsx line 26", {
        fixedHref,
      });
    }
  }, [router]);

  //#endregion  //*======== Form State ===========

  const [formState, setFormState] =
    useState<typeof InitalFormState>(InitalFormState);
  const [errorState, setErrorState] =
    useState<typeof InitalFormState>(InitalFormState);

  const [authErrorState, setAuthErrorState] = useState<DefaultErrorShape>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const useAccountUpdateWithPasswordReset =
    api.account.updateWithPasswordReset.useMutation();

  const revertToInitialState = () => {
    setFormState(InitalFormState);
    setErrorState(InitalFormState);
    setIsLoading(false);
  };

  //#endregion  //*======== Form State ===========

  //#endregion  //*======== State Listeners ===========

  const validateStates = useCallback(
    (fields: (keyof typeof InitalFormState)[] = Object.keys(formState)) => {
      const hasValues: boolean = Object.entries(formState)
        .filter(([k]) => fields.includes(k))
        .every(([, v]) => !!v.trim().length);
      const hasNoErrors = Object.entries(errorState)
        .filter(([k]) => fields.includes(k))
        .every(([, v]) => !v.trim().length);

      return {
        hasValues,
        hasNoErrors,
      };
    },
    [formState, errorState]
  );

  const isSubmitEnabled = useMemo<boolean>(() => {
    if (isLoading || isAuth) return false;
    if (!paramId.length || !paramAccessToken.length) return false;

    const requiredFields: (keyof typeof InitalFormState)[] =
      Object.keys(InitalFormState);

    const { hasValues, hasNoErrors } = validateStates(requiredFields);

    // Check for pwd and cfmPwd
    if (formState.password !== formState.confirmPassword) return false;
    if (!hasValues || !hasNoErrors) return false;
    return true;
  }, [isLoading, isAuth, paramId, paramAccessToken, validateStates, formState]);

  //#endregion  //*======== State Listeners ===========

  //#endregion  //*======== Handlers ===========

  const updateFormState = (id: string, value: string) => {
    value = value ?? "";

    // ERROR: Invalid ID
    const isValidId: boolean = Object.keys(formState).includes(id) ?? false;
    if (!isValidId) return;

    // ERROR: Invalid value (empty)
    const refValues: typeof formState = {
      confirmPassword: formState.password,
    };

    const isValidValue = validateAuthInput(id, value, refValues[id] ?? "");
    setErrorState({
      ...errorState,
      [id]: !isValidValue ? FormErrorMessages[id] : "",
    });

    /// Memomize current form state regardless
    setFormState({
      ...formState,
      [id]: value,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputId: string = event.currentTarget.id;
    const inputValue = event.currentTarget.value ?? "";
    updateFormState(inputId, inputValue);
  };

  const handleResetPassword = async () => {
    if (!isSubmitEnabled || isLoading) return;

    setIsLoading(true);

    try {
      await useAccountUpdateWithPasswordReset.mutateAsync(
        {
          id: paramId,
          accessToken: paramAccessToken,
          password: formState.password,
        },
        {
          onSuccess: (data) => {
            logger("reset-password.tsx line 127", {
              data,
            });

            showNotification({
              icon: <TbCircleCheckFilled />,
              title: "Account Recovered",
              message: "Successfully resetted password.",
            });

            router.replace(
              {
                pathname: `/account/${AuthTypes[0]}`,
              },
              undefined,
              { scroll: true }
            );
          },
          onError: ({ shape }) => {
            logger("index.tsx line 299", { shape });
            setAuthErrorState(shape as DefaultErrorShape);

            showNotification({
              icon: <TbCircleXFilled />,
              title: "Oops, something went wrong",
              message: shape?.message ?? "",
            });
            revertToInitialState();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
    revertToInitialState();
  };

  //#endregion  //*======== Handlers ===========

  //#endregion  //*======== Pre-Render Checks ===========
  useEffect(() => {
    if (!isAuthLoading && isAuth) {
      router.push(
        {
          pathname: `/`,
        },
        undefined,
        { scroll: true }
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, isAuthLoading]);

  //#endregion  //*======== Pre-Render Checks ===========

  return (
    <Layout.Base showAffix={false}>
      <Provider.RenderGuard
        renderIf={!!paramAccessToken}
        fallbackComponent={
          <UnknownState
            svgNode={<EmptyNotifications />}
            title="Expired Link"
            subtitle="Uh oh, this link has expired"
          />
        }
      >
        <Container
          size="xs"
          py={theme.spacing.md}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.xl,
          }}
        >
          <AuthPassword
            formState={
              getPartialClonedObject(
                formState,
                ["password", "confirmPassword"],
                true
              ) as PasswordFormState
            }
            errorState={
              getPartialClonedObject(
                errorState,
                ["password", "confirmPassword"],
                true
              ) as PasswordFormState
            }
            onChange={handleInputChange}
          />

          <Button
            variant="gradient"
            loading={isLoading}
            disabled={!isSubmitEnabled || isLoading}
            onClick={handleResetPassword}
          >
            Update Password
          </Button>

          {!!authErrorState && (
            <Alert
              icon={<TbAlertCircle size={16} />}
              title="Recovery Failed"
              color={isDark ? "red" : "red.7"}
            >
              <Text color="dimmed">{authErrorState.message}</Text>
            </Alert>
          )}
        </Container>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default ResetPasswordPage;
