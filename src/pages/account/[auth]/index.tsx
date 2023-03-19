import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Stepper,
  StepProps,
  Text,
  TextInput,
  Title,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { DefaultErrorShape } from "@trpc/server";
import { InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { ProviderType } from "next-auth/providers";
import {
  ClientSafeProvider,
  getProviders,
  signIn,
  useSession,
} from "next-auth/react";
import {
  ChangeEvent,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IconType } from "react-icons";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { TbAlertCircle } from "react-icons/tb";

import { Layout, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";
import AuthEmail from "@/components/Pages/Auth/AuthEmail";
import AuthPassword, {
  PasswordFormState,
} from "@/components/Pages/Auth/AuthPassword";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";
import { getPartialClonedObject } from "@/utils/helpers";
import { isEmail, isName } from "@/utils/validations";

import ErrorClient from "~/assets/images/error-client.svg";

//#endregion  //*======== Utilities ===========

export const AuthTypes: string[] = ["signIn", "signUp"];
export type AuthType = (typeof AuthTypes)[number];

export const ProviderIcons: {
  [key in ClientSafeProvider["name"]]: IconType;
} = {
  Google: FaGoogle,
  GitHub: FaGithub,
};

export const InitalFormState: Record<string, string> = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
};

export const FormErrorMessages: {
  [key in keyof typeof InitalFormState]: string;
} = {
  name: "Invalid Name",
  email: "Invalid Email",
  password: "Invalid Password",
  confirmPassword: "Passwords do not match",
};

export const getEmailSuggestions = (input: string) =>
  input.trim().length > 0 && !input.includes("@")
    ? ["gmail.com", "outlook.com", "yahoo.com"].map(
        (provider) => `${input}@${provider}`
      )
    : [];

export const validateAuthInput = (id: string, value: string, refVal = "") => {
  const validations: {
    [key in keyof typeof InitalFormState]: (
      val: string,
      refVal?: string
    ) => boolean;
  } = {
    email: (val: string) => isEmail(val),
    password: (val: string) => {
      const isValid = !!val.length;
      return isValid;
    },
    confirmPassword: (val: string, ref: string = refVal) => {
      const isValid = !!val.length && ref === val;
      return isValid;
    },
    name: (val: string) => isName(val),
  };
  return validations[id](value);
};

//#endregion  //*======== Utilities ===========

export const getServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const AccountAuthPage: NextPage<Props> = ({ providers }: Props) => {
  const router = useRouter();
  const { auth } = router.query;
  const theme = useMantineTheme();
  const { data: sessionData } = useSession();

  const isDark: boolean = theme.colorScheme === "dark";

  const isAuth = !!sessionData;
  const paramAuth: AuthType =
    AuthTypes.filter((t) => t === (auth ?? "").toString())?.[0] ?? "";
  const isValidAuthType: boolean = (!!paramAuth && !!paramAuth.length) ?? false;
  const isNewUser: boolean = paramAuth === AuthTypes[1];

  const credentialProviders: ClientSafeProvider[] = Object.values(
    providers ?? []
  ).filter(({ type }) => type === "credentials");
  const hasCredentials = !!credentialProviders.length;

  //#endregion  //*======== Form State ===========
  const [formState, setFormState] =
    useState<typeof InitalFormState>(InitalFormState);
  const [errorState, setErrorState] =
    useState<typeof InitalFormState>(InitalFormState);
  const [authStep, setAuthStep] = useState<number>(0);

  const useAccountSignUp = api.account.signUp.useMutation();
  const useAccountSignIn = api.account.signIn.useMutation();

  const [authErrorState, setAuthErrorState] = useState<DefaultErrorShape>();
  const [isLoadingProvider, setIsLoadingProvider] = useState<string>("");

  const revertToInitialState = () => {
    setFormState(InitalFormState);
    setErrorState(InitalFormState);
    setAuthStep(0);
    setIsLoadingProvider("");
  };

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

  const handleRawInput = (inputId: string, inputValue: string) => {
    inputValue = inputValue.trim();
    updateFormState(inputId, inputValue);
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputId: string = event.currentTarget.id;
    const inputValue = event.currentTarget.value ?? "";
    updateFormState(inputId, inputValue);
  };

  //#endregion  //*======== Form State ===========

  //#endregion  //*======== Submission ===========

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
    if (isLoadingProvider || isAuth) return false;

    const requiredFields: (keyof typeof InitalFormState)[] = isNewUser
      ? ["name", "email", "password", "confirmPassword"]
      : ["email", "password"];

    const { hasValues, hasNoErrors } = validateStates(requiredFields);

    // Check for pwd and cfmPwd
    if (isNewUser && formState.password !== formState.confirmPassword)
      return false;
    if (!hasValues || !hasNoErrors) return false;
    return true;
  }, [isAuth, isLoadingProvider, validateStates, isNewUser, formState]);

  const handleAuthAction = async (
    providerId: ClientSafeProvider["id"],
    type: ClientSafeProvider["type"]
  ) => {
    const isCredentialProvider: boolean = type === "credentials" ?? false;
    if (isCredentialProvider && !isSubmitEnabled) return;

    try {
      setIsLoadingProvider(providerId);

      // with OAuth
      if (!isCredentialProvider) {
        signIn(providerId, { callbackUrl: "/" });
        return;
      }

      switch (paramAuth) {
        case AuthTypes[0]: {
          useAccountSignIn.mutate(
            {
              email: formState.email,
              password: formState.password,
            },
            {
              onSuccess(data) {
                if (data) {
                  signIn(providerId, {
                    name: data.name,
                    email: data.email,
                    password: formState.password,
                    callbackUrl: "/",
                  });
                  logger("index.tsx line 268", { data });
                  return;
                }
              },
              onError({ shape }) {
                logger("index.tsx line 299", { shape });
                setAuthErrorState(shape as DefaultErrorShape);
                revertToInitialState();
              },
            }
          );
          break;
        }
        case AuthTypes[1]: {
          useAccountSignUp.mutate(
            {
              name: formState.name,
              email: formState.email,
              password: formState.password,
            },
            {
              onSuccess(data) {
                if (data) {
                  signIn(providerId, {
                    name: data.name,
                    email: data.email,
                    password: formState.password,
                    callbackUrl: "/",
                  });
                  return;
                }
              },
              onError({ shape }) {
                logger("index.tsx line 299", { shape });
                setAuthErrorState(shape as DefaultErrorShape);
                revertToInitialState();
              },
            }
          );
          break;
        }
      }
    } catch (err) {
      if (!(err instanceof Error)) return;
      logger("index.tsx line 295", {
        err,
      });
    }
  };

  //#endregion  //*======== Submission ===========

  //#endregion  //*======== Pre-Render Checks ===========
  useEffect(() => {
    if (isAuth && isValidAuthType) {
      router.push(
        {
          pathname: `/`,
        },
        undefined,
        { scroll: true }
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, paramAuth, isValidAuthType]);

  //#endregion  //*======== Pre-Render Checks ===========

  const stepList: {
    label: StepProps["label"];
    description: StepProps["description"];
    content: (options?: Record<string, boolean>) => ReactNode;
    fields: (keyof typeof InitalFormState)[];
  }[] = [
    {
      label: "First step",
      description: "Register your name",
      fields: ["name"],
      content: () => (
        <TextInput
          placeholder="Full name"
          label="Tell us your name"
          error={errorState.name}
          withAsterisk
          id="name"
          value={formState.name}
          onChange={handleInputChange}
        />
      ),
    },
    {
      label: "Second step",
      description: "Create an account",
      fields: ["email", "password", "confirmPassword"],
      content: ({
        hideActionButton = false,
        hideForgotPassword = false,
        showConfirmPassword = false,
      }: Record<string, boolean> = {}): ReactNode =>
        credentialProviders.map(({ id, name, type }) => (
          <Fragment key={name}>
            <AuthEmail
              value={formState.email}
              onChange={(value) => handleRawInput("email", value)}
              label="Email"
              id="email"
              placeholder="Email"
              error={errorState.email}
              data={[]}
            />

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
              showForgotPassword={!hideForgotPassword}
              showConfirmPassword={showConfirmPassword}
            />

            {!hideActionButton && (
              <Button
                onClick={() => handleAuthAction(id, type)}
                loading={isLoadingProvider === id}
                disabled={!isSubmitEnabled}
              >
                Sign In
              </Button>
            )}
          </Fragment>
        )),
    },
  ];

  const canProceedStep = useMemo(() => {
    const { hasValues, hasNoErrors } = validateStates(
      stepList[authStep].fields
    );

    if (!hasValues || !hasNoErrors) return false;
    return true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStep, validateStates]);

  const nextStep = () => {
    if (!canProceedStep) return;
    if (!isSubmitEnabled) {
      setAuthStep((current) =>
        current < stepList.length ? current + 1 : current
      );
      return;
    }

    // Proceed with Credential auth
    const provider: ProviderType = "credentials";
    handleAuthAction(provider, provider);
  };
  const prevStep = () =>
    setAuthStep((current) => (current > 0 ? current - 1 : current));

  return (
    <Layout.Base showAffix={false}>
      <Provider.RenderGuard
        renderIf={isValidAuthType && !isAuth}
        fallbackComponent={
          <UnknownState
            svgNode={<ErrorClient />}
            title="Account page not found"
            subtitle="Hey, you aren't supposed to be here"
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
          <Provider.RenderGuard renderIf={hasCredentials && !isNewUser}>
            {stepList[1].content()}
          </Provider.RenderGuard>

          <Provider.RenderGuard renderIf={hasCredentials && isNewUser}>
            <Stepper
              active={authStep}
              onStepClick={setAuthStep}
              breakpoint="sm"
            >
              {stepList.map(({ label, description }, idx) => (
                <Stepper.Step
                  key={`step-${idx}-${label}`}
                  label={label}
                  description={description}
                />
              ))}
            </Stepper>

            {stepList.map(({ content }, idx) => {
              return (
                <Provider.RenderGuard
                  key={`step-${idx}-content`}
                  renderIf={authStep === idx}
                >
                  <Fragment>
                    {content({
                      hideActionButton: isNewUser,
                      hideForgotPassword: isNewUser,
                      showConfirmPassword: isNewUser,
                    })}
                  </Fragment>
                </Provider.RenderGuard>
              );
            })}

            <Group position="apart">
              <Transition
                transition="slide-left"
                mounted={!!authStep}
              >
                {(transitionStyles) => (
                  <Button
                    variant="default"
                    onClick={prevStep}
                    disabled={authStep < 1}
                    style={transitionStyles}
                  >
                    Back
                  </Button>
                )}
              </Transition>
              <Button
                onClick={nextStep}
                disabled={!canProceedStep}
                loading={!!isLoadingProvider}
                sx={{
                  flex: canProceedStep && isSubmitEnabled ? 1 : "unset",
                }}
              >
                {authStep === stepList.length - 1 ? "Sign Up" : "Next step"}
              </Button>
            </Group>
          </Provider.RenderGuard>

          {!!authErrorState && (
            <Alert
              icon={<TbAlertCircle size={16} />}
              title={`Sign ${isNewUser ? "Up" : "In"} Failed`}
              color={isDark ? "red" : "red.7"}
            >
              <Text color="dimmed">{authErrorState.message}</Text>
            </Alert>
          )}

          <Box component="aside">
            <Divider
              my="xs"
              labelPosition="center"
              label={
                <Title
                  order={2}
                  size="p"
                  color="dimmed"
                >
                  or continue with
                </Title>
              }
            />
            <Group position="center">
              {Object.values(providers ?? [])
                .filter(({ name }) => Object.keys(ProviderIcons).includes(name))
                .map(({ id, name, type }) => {
                  const ProviderIcon = ProviderIcons[name];
                  return (
                    <Button
                      key={name}
                      onClick={() => handleAuthAction(id, type)}
                      leftIcon={<ProviderIcon />}
                      loading={isLoadingProvider === id}
                    >
                      {name}
                    </Button>
                  );
                })}
            </Group>
          </Box>
        </Container>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountAuthPage;
