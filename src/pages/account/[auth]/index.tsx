import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Divider,
  Group,
  PasswordInput,
  Stepper,
  StepProps,
  Text,
  TextInput,
  Title,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import { DefaultErrorShape, Maybe } from "@trpc/server";
import { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";
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
  useMemo,
  useState,
} from "react";
import { IconType } from "react-icons";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { TbAlertCircle } from "react-icons/tb";

import { Layout, Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

//#endregion  //*======== Utilities ===========

export const AuthTypes: string[] = ["signIn", "signUp"];
export type AuthType = (typeof AuthTypes)[number];

export const ProviderIcons: {
  [key in ClientSafeProvider["name"]]: IconType;
} = {
  Google: FaGoogle,
  GitHub: FaGithub,
};

const InitalFormState: Record<string, string> = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
};

const FormErrorMessages: {
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

const validateAuthInput = (id: string, value: string, refVal = "") => {
  const validations: {
    [key in keyof typeof InitalFormState]: (
      val: string,
      refVal?: string
    ) => boolean;
  } = {
    email: (val: string) => {
      const regexEmail = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/g;
      const isValid: boolean = !!val.length && !!val.match(regexEmail);
      return isValid;
    },
    password: (val: string) => {
      const isValid = !!val.length;
      return isValid;
    },
    confirmPassword: (val: string, ref: string = refVal) => {
      const isValid = !!val.length && ref === val;
      return isValid;
    },
    name: (val: string) => {
      const isValid = !!val.length;
      return isValid;
    },
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
  const paramAuth: AuthType = AuthTypes.filter(
    (t) => t === (auth ?? "").toString()
  )[0];
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

  const [authErrorState, setAuthErrorState] =
    useState<Maybe<DefaultErrorShape>>(undefined);
  const [isLoadingProvider, setIsLoadingProvider] = useState<string>("");

  const { start: revertToInitialState } = useTimeout(() => {
    setFormState(InitalFormState);
    setErrorState(InitalFormState);
    setAuthStep(0);
    setIsLoadingProvider("");
  }, 1000);

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
    if (!hasValues || !hasNoErrors) return false;
    return true;
  }, [isAuth, isLoadingProvider, validateStates, isNewUser]);

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
                signIn(providerId, {
                  name: data.name,
                  email: data.email,
                  password: formState.password,
                  callbackUrl: "/",
                });
                return;
              },
              onError({ shape }) {
                setAuthErrorState(shape);
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
                signIn(providerId, {
                  name: data.name,
                  email: data.email,
                  password: formState.password,
                  callbackUrl: "/account/signUp",
                });
                return;
              },
              onError({ shape }) {
                setAuthErrorState(shape);
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
    } finally {
      revertToInitialState();
    }
  };

  //#endregion  //*======== Submission ===========

  //#endregion  //*======== Pre-Render Checks ===========
  if (isAuth) {
    router.push(
      {
        pathname: `/account`,
      },
      undefined,
      { scroll: true }
    );
  }
  //#endregion  //*======== Pre-Render Checks ===========

  const stepList: {
    label: StepProps["label"];
    description: StepProps["description"];
    content: (options?: Record<string, boolean>) => ReactNode;
    fields: (keyof typeof InitalFormState)[];
  }[] = [
    {
      label: "First step",
      description: "Create an account",
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
      description: "Verify email",
      fields: ["email", "password", "confirmPassword"],
      content: ({
        hideActionButton = false,
        hideForgotPassword = false,
        showConfirmPassword = false,
      }: Record<string, boolean> = {}): ReactNode =>
        credentialProviders.map(({ id, name, type }) => (
          <Fragment key={name}>
            <Autocomplete
              value={formState.email}
              onChange={(value) => handleRawInput("email", value)}
              label="Email"
              id="email"
              placeholder="Email"
              data={getEmailSuggestions(formState.email)}
              error={errorState.email}
            />

            <PasswordInput
              value={formState.password}
              onChange={handleInputChange}
              error={errorState.password}
              label={
                <Group position="apart">
                  <Text>Password</Text>
                  {!hideForgotPassword && (
                    <Text
                      component={Link}
                      href="#forgot-password"
                      color="primary"
                    >
                      Forgot password?
                    </Text>
                  )}
                </Group>
              }
              id="password"
              placeholder="Password"
              sx={{
                label: {
                  width: "100%",
                },
              }}
            />

            <Transition
              transition="slide-down"
              mounted={!!formState.password.length && showConfirmPassword}
            >
              {(transitionStyles) => (
                <PasswordInput
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  error={errorState.confirmPassword}
                  label="Confirm Password"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  style={transitionStyles}
                />
              )}
            </Transition>

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
      <Provider.RenderGuard renderIf={isValidAuthType && !isAuth}>
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
