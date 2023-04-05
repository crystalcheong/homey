import {
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Collapse,
  Container,
  Divider,
  Group,
  List,
  Stepper,
  StepProps,
  Text,
  TextInput,
  Title,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { User } from "@prisma/client";
import { DefaultErrorShape } from "@trpc/server";
import { InferGetServerSidePropsType, NextPage } from "next";
import dynamic from "next/dynamic";
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
  useEffect,
  useMemo,
  useState,
} from "react";
import { TbAlertCircle } from "react-icons/tb";

import { Gov } from "@/data/clients/gov";
import { Metadata } from "@/data/static";

import { Layout, Provider } from "@/components";
const BetaWarning = dynamic(() => import("@/components/Layouts/BetaWarning"));
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));
const AuthEmail = dynamic(() => import("@/components/Pages/Auth/AuthEmail"));
const AuthPassword = dynamic(
  () => import("@/components/Pages/Auth/AuthPassword")
);
const TermsAndPrivacyLinks = dynamic(
  () => import("@/components/Pages/Info/TermsAndPrivacyLinks")
);

import { api, getPartialClonedObject, logger } from "@/utils";

import {
  AuthType,
  AuthTypes,
  FormErrorMessages,
  InitalFormState,
  PasswordFormState,
  ProviderIcons,
  validateAuthInput,
} from "@/types/account";

import ErrorClient from "~/assets/images/error-client.svg";

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
  const { data: sessionData, status: sessionStatus } = useSession();
  const isAuth = !!sessionData;
  const isAuthLoading: boolean = sessionStatus === "loading";

  const isDark: boolean = theme.colorScheme === "dark";

  const paramAuth: AuthType =
    AuthTypes.filter((t) => t === (auth ?? "").toString())?.[0] ?? "";
  const isValidAuthType: boolean = (!!paramAuth && !!paramAuth.length) ?? false;
  const isNewUser: boolean = paramAuth === AuthTypes[1];

  const credentialProviders: ClientSafeProvider[] = Object.values(
    providers ?? []
  ).filter(({ type }) => type === "credentials");
  const hasCredentials = !!credentialProviders.length;

  const [isAgent, setIsAgent] = useState<boolean>(false);

  const handleToggleAgentSwitch = () => {
    if (!isNewUser) return;
    setIsAgent(!isAgent);
  };

  //#endregion  //*======== Form State ===========
  const [formState, setFormState] =
    useState<typeof InitalFormState>(InitalFormState);
  const [errorState, setErrorState] =
    useState<typeof InitalFormState>(InitalFormState);
  const [authStep, setAuthStep] = useState<number>(0);
  const [, setIsCEALicensed] = useState<boolean>(false);

  const useAccountSignUp = api.account.signUp.useMutation();
  const useAccountSignUpAgent = api.account.signUpAgent.useMutation();
  const useAccountSignIn = api.account.signIn.useMutation();
  const useGovCheckIsCEALicensed = api.gov.checkIsCEALicensed.useMutation();

  const [authErrorState, setAuthErrorState] = useState<DefaultErrorShape>();
  const [isLoadingProvider, setIsLoadingProvider] = useState<string>("");

  const revertToInitialState = () => {
    setFormState(InitalFormState);
    setErrorState(InitalFormState);
    setAuthStep(0);
    setIsLoadingProvider("");
    setIsCEALicensed(false);
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

    // AGENT
    if (isAgent) requiredFields.push("ceaLicense");

    const { hasValues, hasNoErrors } = validateStates(requiredFields);

    // Check for pwd and cfmPwd
    if (isNewUser && formState.password !== formState.confirmPassword)
      return false;
    if (!hasValues || !hasNoErrors) return false;
    return true;
  }, [
    isLoadingProvider,
    isAuth,
    isNewUser,
    isAgent,
    validateStates,
    formState.password,
    formState.confirmPassword,
  ]);

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
          await useAccountSignIn.mutateAsync(
            {
              email: formState.email,
              password: formState.password,
            },
            {
              onSuccess: (data) => {
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
              onError: ({ shape }) => {
                logger("index.tsx line 299", { shape });
                setAuthErrorState(shape as DefaultErrorShape);
                revertToInitialState();
              },
            }
          );
          break;
        }
        case AuthTypes[1]: {
          const onSuccess = (data: User) => {
            if (data) {
              signIn(providerId, {
                name: data.name,
                email: data.email,
                password: formState.password,
                callbackUrl: "/",
              });
              return;
            }
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const onError = ({ shape }: any) => {
            logger("index.tsx line 299", { shape });
            setAuthErrorState(shape as DefaultErrorShape);
            revertToInitialState();
          };

          const user: User = await useAccountSignUp.mutateAsync(
            {
              name: formState.name,
              email: formState.email,
              password: formState.password,
            },
            {
              onSuccess: (data) => {
                if (!isAgent) onSuccess(data);
              },
              onError,
            }
          );

          if (isAgent && !!user) {
            logger("index.tsx line 325", {
              user,
              isAgent,
            });
            await useAccountSignUpAgent.mutateAsync(
              {
                id: user.id,
                name: formState.name,
                ceaLicense: formState.ceaLicense,
              },
              {
                onSuccess: (data) => onSuccess(data.user),
                onError,
              }
            );
          }
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
    logger("index.tsx line 318", {
      isAuth,
      isValidAuthType,
      query: router.query,
    });

    if (isAuthLoading) {
      revertToInitialState();
    }
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
  }, [isAuth, isValidAuthType, isAuthLoading]);

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
      fields: isAgent ? ["name", "ceaLicense"] : ["name"],
      content: () => (
        <>
          <TextInput
            placeholder="Full name"
            label="Tell us your name"
            error={errorState.name}
            withAsterisk
            id="name"
            value={formState.name}
            onChange={handleInputChange}
          />

          <Checkbox
            // hidden={!isAgent || !isNewUser}
            hidden={!isNewUser}
            label={
              <>
                Register as Agent&nbsp;<Badge size="xs">Preview</Badge>
              </>
            }
            description={
              <>
                Get verified as a &nbsp;
                <Text
                  component={Link}
                  href="https://www.cea.gov.sg/professionals/estate-agents-licensing-matters/apply-for-estate-agent-licence#lnkB"
                  target="_blank"
                  variant="gradient"
                >
                  CEA licensed agent
                </Text>
                &nbsp; to post property listings
              </>
            }
            radius="md"
            checked={isAgent && isNewUser}
            onChange={handleToggleAgentSwitch}
          />

          <Collapse
            in={isAgent && isNewUser}
            transitionDuration={100}
            transitionTimingFunction="linear"
          >
            <TextInput
              placeholder="CEA License"
              label={
                <Group position="apart">
                  <Text>CEA License</Text>
                  <Text
                    component={Link}
                    href="https://www.cea.gov.sg/professionals/estate-agents-licensing-matters/apply-for-estate-agent-licence#lnkB"
                    target="_blank"
                    variant="gradient"
                  >
                    Licensing Criteria
                  </Text>
                </Group>
              }
              error={errorState.ceaLicense}
              id="ceaLicense"
              value={formState.ceaLicense}
              onChange={handleInputChange}
              sx={{
                label: {
                  width: "100%",
                },
              }}
            />
          </Collapse>
        </>
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
                variant="gradient"
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
    const fields = stepList[authStep].fields;
    if (isAgent) fields.push("ceaLicense");

    const { hasValues, hasNoErrors } = validateStates(fields);

    if (!hasValues || !hasNoErrors) return false;
    return true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStep, validateStates, isAgent]);

  const nextStep = async () => {
    if (!canProceedStep) return;
    if (!isSubmitEnabled) {
      if (authStep === 0 && isAgent) {
        let isValidLicense = false;
        try {
          await useGovCheckIsCEALicensed.mutateAsync(
            {
              name: formState.name,
              ceaLicense: formState.ceaLicense,
            },
            {
              onSuccess: (data: boolean) => {
                const isLicensed: boolean = data ?? false;
                setIsCEALicensed(isLicensed);
                isValidLicense = isLicensed;

                if (!data) {
                  setAuthErrorState({
                    code: -32004,
                    message: FormErrorMessages["ceaLicense"],
                  } as DefaultErrorShape);
                }
              },
              onError: ({ shape }) => {
                logger("index.tsx line 299", { shape });
                setAuthErrorState(shape as DefaultErrorShape);
                revertToInitialState();
                return;
              },
            }
          );
        } catch (error) {
          console.error(error);
          return;
        }

        if (!isValidLicense) return;
      }

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

  const isNotValidated: boolean = new Gov().isNotValidated ?? false;

  return (
    <Layout.Base showAffix={false}>
      <Provider.RenderGuard
        renderIf={isValidAuthType && !isAuth}
        fallbackComponent={
          <UnknownState
            hidden={isAuthLoading}
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
          {isNotValidated && isNewUser && (
            <BetaWarning
              title="Beta Preview"
              content={
                <>
                  For testing purposes, this following fields will not be
                  validated:
                  <List size="sm">
                    <List.Item>
                      CEA License (
                      <Text
                        variant="gradient"
                        component={Link}
                        href="https://www.cea.gov.sg/aceas/public-register/ea/1"
                        target="_blank"
                      >
                        Registry
                      </Text>
                      )
                    </List.Item>
                  </List>
                </>
              }
            />
          )}
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
                variant="gradient"
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
            {authStep === 0 && (
              <Text
                component="p"
                color="dimmed"
                size="sm"
                m={0}
              >
                {isNewUser ? `Already` : `Don't`} have an account?&nbsp;
                <Text
                  component={Link}
                  href={`/account/${AuthTypes[+!isNewUser]}`}
                  variant="gradient"
                  size="sm"
                  fw={700}
                >
                  Sign&nbsp;{isNewUser ? "In" : "Up"}
                </Text>
              </Text>
            )}

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
                      variant="gradient"
                      onClick={() => handleAuthAction(id, type)}
                      leftIcon={<ProviderIcon />}
                      loading={isLoadingProvider === id}
                    >
                      {name}
                    </Button>
                  );
                })}
            </Group>

            {/* Terms & Conditions */}
            <Text
              component="p"
              size="xs"
              ta="center"
              mt="xl"
            >
              By continuing, you agree to {Metadata.name}'s{" "}
              <TermsAndPrivacyLinks />.
            </Text>
          </Box>
        </Container>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountAuthPage;
