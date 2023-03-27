import {
  Alert,
  Button,
  Container,
  Group,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { DefaultErrorShape } from "@trpc/server";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TbAlertCircle, TbArrowBack, TbMailFast } from "react-icons/tb";

import { Layout } from "@/components";
import AuthEmail from "@/components/Pages/Auth/AuthEmail";

import { validateAuthInput } from "@/pages/account/[auth]";
import { api, getBaseUrl, logger, useIsTablet } from "@/utils";

const InitalFormState: Record<string, string> = {
  email: "",
};

const FormErrorMessages: {
  [key in keyof typeof InitalFormState]: string;
} = {
  email: "Invalid Email",
};

const ForgotPasswordPage: NextPage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const isTablet = useIsTablet(theme);
  const { data: sessionData, status: sessionStatus } = useSession();

  const isDark: boolean = theme.colorScheme === "dark";
  const isAuth = !!sessionData;
  const isAuthLoading: boolean = sessionStatus === "loading";

  //#endregion  //*======== Form State ===========

  const [formState, setFormState] =
    useState<typeof InitalFormState>(InitalFormState);
  const [errorState, setErrorState] =
    useState<typeof InitalFormState>(InitalFormState);

  //#endregion  //*======== Form State ===========

  const [baseUrl, setBaseUrl] = useState<string>(getBaseUrl());
  const [authErrorState, setAuthErrorState] = useState<DefaultErrorShape>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const useAccountRequestPasswordReset =
    api.account.requestPasswordReset.useMutation();

  const revertToInitialState = () => {
    setFormState(InitalFormState);
    setErrorState(InitalFormState);
    setIsLoading(false);
    setAuthErrorState(undefined);
  };

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

    const requiredFields: (keyof typeof InitalFormState)[] =
      Object.keys(InitalFormState);

    const { hasValues, hasNoErrors } = validateStates(requiredFields);

    if (!hasValues || !hasNoErrors) return false;
    return true;
  }, [isLoading, isAuth, validateStates]);

  //#endregion  //*======== Functions ===========

  const updateFormState = (id: string, value: string) => {
    value = value ?? "";

    // ERROR: Invalid ID
    const isValidId: boolean = Object.keys(formState).includes(id) ?? false;
    if (!isValidId) return;

    const isValidValue = validateAuthInput(id, value);
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

  //#endregion  //*======== Functions ===========

  //#endregion  //*======== Handlers ===========

  const handleRawInput = (inputId: string, inputValue: string) => {
    inputValue = inputValue.trim();
    updateFormState(inputId, inputValue);
  };

  const handleResetPassword = async () => {
    if (!isSubmitEnabled || isLoading) return;

    setIsLoading(true);
    const redirectHref = `${baseUrl}/account/auth/reset-password`;

    try {
      await useAccountRequestPasswordReset.mutateAsync(
        {
          email: formState.email,
          redirectTo: redirectHref,
        },
        {
          onSuccess: (data) => {
            logger("forgot-password.tsx line 127", {
              data,
            });
            showNotification({
              icon: <TbMailFast />,
              title: "Initiated Recovery",
              message: "Recovery email has been sent",
            });
          },
          onError: ({ shape }) => {
            logger("index.tsx line 299", { shape });
            setAuthErrorState(shape as DefaultErrorShape);
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
    logger("index.tsx line 318", {
      isAuth,
    });
    if (typeof window !== "undefined" && window.location.origin)
      setBaseUrl(window.location.origin);

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
      <Container
        size="xs"
        py={theme.spacing.md}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.xl,
        }}
      >
        <AuthEmail
          value={formState.email}
          onChange={(value) => handleRawInput("email", value)}
          label="Enter your account email"
          id="email"
          placeholder="Email"
          error={errorState.email}
          data={[]}
        />

        <Group>
          <Button
            variant="subtle"
            leftIcon={<TbArrowBack />}
            onClick={() => router.back()}
            hidden={isTablet}
          >
            Back
          </Button>
          <Button
            variant="gradient"
            loading={isLoading}
            disabled={!isSubmitEnabled || isLoading}
            onClick={handleResetPassword}
            sx={{
              flex: 1,
              width: "100%",
            }}
          >
            Reset Password
          </Button>
        </Group>

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
    </Layout.Base>
  );
};

export default ForgotPasswordPage;
