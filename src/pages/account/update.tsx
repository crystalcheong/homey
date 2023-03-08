import {
  Box,
  Button,
  Group,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { useAccountStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import BetaWarning from "@/components/Layouts/BetaWarning";
import AuthPassword, {
  PasswordFormState,
} from "@/components/Pages/Auth/AuthPassword";

import {
  FormErrorMessages,
  InitalFormState,
  validateAuthInput,
} from "@/pages/account/[auth]";
import { api } from "@/utils/api";
import { logger } from "@/utils/debug";
import { getPartialClonedObject } from "@/utils/helpers";

const UpdateFormState: Omit<typeof InitalFormState, "email"> & {
  currentPassword: string;
} = {
  ...getPartialClonedObject(InitalFormState, ["email"]),
  currentPassword: "",
};
const UpdateFormErrors: typeof UpdateFormState = {
  ...getPartialClonedObject(FormErrorMessages, ["email"]),
  currentPassword: "",
};

const AccountUpdatePage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const currentUser = useAccountStore.use.currentUser();

  const [formState, setFormState] =
    useState<typeof UpdateFormState>(UpdateFormState);
  const [errorState, setErrorState] =
    useState<typeof UpdateFormErrors>(UpdateFormState);

  const useAccountDeleteUser = api.account.deleteUser.useMutation();
  const useAccountUpdateUser = api.account.updateUser.useMutation();

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

  const updateFormState = (id: string, value: string) => {
    value = value ?? "";

    // ERROR: Invalid ID
    const isValidId: boolean = Object.keys(formState).includes(id) ?? false;
    if (!isValidId) return;

    // // ERROR: Invalid value (empty)
    // const refValues: typeof formState = {
    //   confirmPassword: formState.password,
    // };

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

  const isSubmitEnabled = useMemo<boolean>(() => {
    if (!isAuth || !currentUser) return false;

    const isUpdatingPassword = !!formState.password.length;

    const requiredFields: (keyof typeof UpdateFormState)[] = isUpdatingPassword
      ? Object.keys(UpdateFormState)
      : ["name"];

    const { hasValues, hasNoErrors } = validateStates(requiredFields);

    // Check for pwd and cfmPwd
    if (isUpdatingPassword && formState.password !== formState.confirmPassword)
      return false;
    if (!hasValues || !hasNoErrors) return false;

    // Check for changes
    const hasChanges: boolean = Object.entries(formState)
      .filter(
        ([k, v]) => Object.keys(currentUser).includes(k) && !!v.trim().length
      )
      .every(
        ([k, v]) => currentUser?.[k as keyof typeof currentUser] !== v ?? true
      );
    if (!hasChanges) return false;

    return true;
  }, [isAuth, validateStates, formState, currentUser]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputId: string = event.currentTarget.id;
    const inputValue = event.currentTarget.value ?? "";
    updateFormState(inputId, inputValue);
  };

  const handleAccountDelete = () => {
    if (!isAuth || !currentUser) return;

    useAccountDeleteUser.mutate(
      {
        id: currentUser.id,
      },
      {
        onSuccess(data) {
          logger("SaveButton.tsx line 69", { data });
          useAccountStore.setState(() => ({
            currentUser: null,
          }));
          signOut();
        },
      }
    );
  };

  const handleAccountUpdate = () => {
    if (!isAuth || !currentUser || !isSubmitEnabled) return;

    useAccountUpdateUser.mutate(
      {
        id: currentUser.id,
        name: formState.name.trim(),
      },
      {
        onSuccess(data) {
          logger("SaveButton.tsx line 69", { data });
          useAccountStore.setState(() => ({
            currentUser: data,
          }));
        },
      }
    );
  };

  //#endregion  //*======== Pre-Render Checks ===========
  useEffect(() => {
    if (!isAuth || !currentUser) {
      router.replace("/account/signIn");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, currentUser]);

  //#endregion  //*======== Pre-Render Checks ===========

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isAuth && !!currentUser}>
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

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.md,
            placeContent: "start",
          }}
        >
          <TextInput
            placeholder={currentUser?.name ?? "Full Name"}
            label="Full Name"
            error={errorState.name}
            withAsterisk
            id="name"
            value={formState.name}
            onChange={handleInputChange}
          />

          {false && (
            <>
              <AuthPassword
                formState={
                  {
                    password: formState.currentPassword,
                    confirmPassword: formState.confirmPassword,
                  } as PasswordFormState
                }
                errorState={
                  {
                    password: errorState.currentPassword,
                    confirmPassword: errorState.confirmPassword,
                  } as PasswordFormState
                }
                onChange={handleInputChange}
                showConfirmPassword={false}
                passwordLabel="Current Password"
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
              />
            </>
          )}

          <Group>
            <Button
              onClick={handleAccountUpdate}
              // loading={isLoadingProvider === id}
              disabled={!isSubmitEnabled}
            >
              Save Changes
            </Button>

            <Button
              color="red"
              variant="outline"
              onClick={handleAccountDelete}
              // loading={isLoadingProvider === id}
            >
              Delete Account
            </Button>
          </Group>
        </Box>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountUpdatePage;