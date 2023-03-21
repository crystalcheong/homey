import {
  Box,
  Button,
  Group,
  Modal,
  PasswordInput,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { TbCircleCheckFilled, TbCircleXFilled } from "react-icons/tb";

import { useAccountStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import ImageUpload, {
  getImageBase64,
  getImageUrl,
} from "@/components/Pages/Account/ImageUpload";
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
  image: string;
} = {
  ...getPartialClonedObject(InitalFormState, ["email"]),
  currentPassword: "",
  image: "",
};
const UpdateFormErrors: typeof UpdateFormState = {
  ...getPartialClonedObject(FormErrorMessages, ["email"]),
  currentPassword: "",
  image: "",
};

const ConfirmationState = {
  input: "",
  status: false,
};

const AccountUpdatePage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const currentUser = useAccountStore.use.currentUser();
  const isOAuthUser: boolean = !currentUser?.password?.length ?? false;

  const [formState, setFormState] =
    useState<typeof UpdateFormState>(UpdateFormState);
  const [errorState, setErrorState] =
    useState<typeof UpdateFormErrors>(UpdateFormState);
  const [profileImage, setProfileImage] = useState<FileWithPath[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [
    showAuthorizationModal,
    { open: openAuthorizationModal, close: closeAuthorizationModal },
  ] = useDisclosure(false);
  const [confirmationState, setConfirmationState] =
    useState<typeof ConfirmationState>(ConfirmationState);

  const revertToInitialState = () => {
    setFormState(UpdateFormState);
    setErrorState(UpdateFormState);
    setProfileImage([]);
    setIsLoading(false);
    closeAuthorizationModal();
    setConfirmationState(ConfirmationState);
  };

  const useAccountDeleteUser = api.accountV2.deleteUser.useMutation();
  const useAccountUpdateUser = api.accountV2.updateUser.useMutation();
  const useAccountAuthorizeChanges =
    api.accountV2.authorizeChanges.useMutation();

  const validateStates = useCallback(
    (fields: (keyof typeof InitalFormState)[] = Object.keys(formState)) => {
      const hasValues: boolean = Object.entries(formState)
        .filter(([k]) => fields.includes(k))
        .every(([, v]) => !!v.trim().length);
      const hasNoValues: boolean = Object.entries(formState).every(
        ([, v]) => !!v.trim().length
      );
      const hasErrors = Object.entries(errorState).every(
        ([, v]) => v.trim().length
      );
      const hasNoErrors = Object.entries(errorState)
        .filter(([k]) => fields.includes(k))
        .every(([, v]) => !v.trim().length);

      return {
        hasValues,
        hasNoErrors,
        hasNoValues,
        hasErrors,
      };
    },
    [formState, errorState]
  );

  const updateFormState = (id: string, value: string) => {
    value = value ?? "";

    // ERROR: Invalid ID
    const isValidId: boolean = Object.keys(formState).includes(id) ?? false;
    if (!isValidId) return;

    // ERROR: Invalid value (empty)
    const refValues: Partial<typeof formState> = {
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

  const isSubmitEnabled = useMemo<boolean>(() => {
    if (!isAuth || !currentUser) return false;

    // Check for changes
    const inputFields: [string, string][] = Object.entries(formState).filter(
      ([k, v]) => Object.keys(currentUser).includes(k) && !!v.trim().length
    );
    /// EXIT 1: All fields are empty
    if (!inputFields.length) return false;
    const hasChanges: boolean = inputFields.every(
      ([k, v]) => currentUser?.[k as keyof typeof currentUser] !== v ?? false
    );
    /// EXIT 2: Inputs are no different than the original
    if (!hasChanges) return false;

    // Input validation
    const isUpdatingPassword = !isOAuthUser && !!formState.password.length;
    const requiredFields: (keyof typeof UpdateFormState)[] = isUpdatingPassword
      ? ["password", "confirmPassword"]
      : [];

    const { hasValues, hasNoErrors, hasErrors } =
      validateStates(requiredFields);

    // Check for pwd and cfmPwd
    if (isUpdatingPassword && formState.password !== formState.confirmPassword)
      return false;
    if ((requiredFields.length && !hasValues) || !hasNoErrors) return false;
    if (hasErrors) return false;

    return true;
  }, [isAuth, currentUser, formState, isOAuthUser, validateStates]);

  const isConfirmEnabled = useMemo<boolean>(() => {
    if (
      !showAuthorizationModal ||
      !currentUser ||
      !isSubmitEnabled ||
      !confirmationState.input.length
    )
      return false;

    let isAuthorized = false;

    if (isOAuthUser) {
      isAuthorized = currentUser.name === confirmationState.input;
    }

    return isAuthorized;
  }, [
    confirmationState.input,
    currentUser,
    isOAuthUser,
    isSubmitEnabled,
    showAuthorizationModal,
  ]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputId: string = event.currentTarget.id;
    const inputValue = event.currentTarget.value ?? "";
    updateFormState(inputId, inputValue);
  };

  const handleConfirmationInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.currentTarget.value ?? "";
    logger("update.tsx line 188", { inputValue });

    /// Memomize current form state regardless
    setConfirmationState({
      ...confirmationState,
      input: inputValue,
    });
  };

  const handleImageUpload = async (files: FileWithPath[]) => {
    if (!files.length) return;

    setProfileImage(files);
    const imageUrl: string = getImageUrl(files[0]);

    // const getBase64Image = (
    //   imageUrl: string
    // ) => {
    //   if (!imageUrl.length) return null;

    //   return Buffer.from(imageUrl, 'base64')
    // }

    const filePath: string = files[0].path ?? "";
    // const base64File: Buffer | null = getBase64Image(imageUrl)
    const base64Image: string = (await getImageBase64(files[0])) as string;
    logger("update.tsx line 146", {
      files,
      imageUrl,
      base64Image,
      filePath,
    });
    updateFormState("image", base64Image);
  };

  const getPasswordAuthorization = useCallback(
    async () => {
      if (!currentUser) return false;
      let isAuthorized: boolean = isConfirmEnabled;
      if (!isOAuthUser && !isAuthorized) {
        try {
          await useAccountAuthorizeChanges.mutateAsync(
            {
              id: currentUser.id,
              [isOAuthUser ? "name" : "password"]: confirmationState.input,
            },
            {
              onSuccess: (data) => {
                isAuthorized = data ?? false;
                logger("update.tsx line 263", { data });
              },
              onError: () => {
                showNotification({
                  icon: <TbCircleXFilled />,
                  title: isDeleting
                    ? "Unable to delete account"
                    : "Unable to confirm changes",
                  message: "Invalid authorization confirmation",
                });
                setIsLoading(false);
                setConfirmationState({
                  input: ConfirmationState.input,
                  status: isAuthorized,
                });
              },
            }
          );
        } catch (error) {
          console.error(error);
        }
      }

      return isAuthorized;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      confirmationState.input,
      currentUser,
      isConfirmEnabled,
      isDeleting,
      isOAuthUser,
    ]
  );

  const handleAccountDelete = async () => {
    if (!isAuth || !currentUser || isLoading) return;

    setIsLoading(true);
    let isAuthorized: boolean = isConfirmEnabled;
    if (!isOAuthUser && !isAuthorized) {
      isAuthorized = await getPasswordAuthorization();
    }
    if (!isAuthorized) return;

    await useAccountDeleteUser.mutateAsync(
      {
        id: currentUser.id,
      },
      {
        onSuccess(data) {
          logger("SaveButton.tsx line 69", { data });
          showNotification({
            icon: <TbCircleCheckFilled />,
            title: "Account Deleted",
            message: "All account data has been deleted",
          });
          useAccountStore.setState(() => ({
            currentUser: null,
          }));
          signOut();
        },
      }
    );

    setIsLoading(false);
  };

  const handleAccountUpdate = async () => {
    if (!isAuth || !currentUser || (!isSubmitEnabled && !profileImage.length))
      return;

    setIsLoading(true);
    let isAuthorized: boolean = isConfirmEnabled;
    if (!isOAuthUser && !isAuthorized) {
      isAuthorized = await getPasswordAuthorization();
    }
    if (!isAuthorized) return;

    try {
      await useAccountUpdateUser.mutateAsync(
        {
          id: currentUser.id,
          name: formState.name.trim(),
          image: formState.image.trim(),
          password: formState.password,
        },
        {
          onSuccess: (data) => {
            logger("SaveButton.tsx line 69", { data });
            useAccountStore.setState(() => ({
              currentUser: data,
            }));

            showNotification({
              icon: <TbCircleCheckFilled />,
              title: "Account Updated",
              message: "Changes to account are applied",
            });
          },
          onError: ({ shape }) => {
            logger("index.tsx line 299", { shape });
            setIsLoading(false);

            showNotification({
              icon: <TbCircleXFilled />,
              title: "Oops, something went wrong",
              message: shape?.message ?? "",
            });
          },
          onSettled: () => {
            revertToInitialState();
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!isAuth || !currentUser) return;

    await useAccountUpdateUser.mutateAsync(
      {
        id: currentUser.id,
        removeImage: true,
      },
      {
        onSuccess: (data) => {
          logger("SaveButton.tsx line 69", { data });
          useAccountStore.setState(() => ({
            currentUser: data,
          }));

          showNotification({
            icon: <TbCircleCheckFilled />,
            title: "Account Updated",
            message: "Profile image has been deleted.",
          });
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

  logger("update.tsx line 233", {
    isSubmitEnabled,
    isLoading,

    formState,
    profileImage,
  });

  return (
    <Layout.Base
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <Provider.RenderGuard renderIf={isAuth && !!currentUser}>
        <Title
          order={3}
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
          <Group position="center">
            <ImageUpload
              placeholder={currentUser?.image ?? null}
              files={profileImage}
              onDrop={handleImageUpload}
            />
            <Box
              component="aside"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
                placeContent: "center",
              }}
            >
              <Button onClick={handleRemoveProfileImage}>
                Remove profile picture
              </Button>
              <Button onClick={() => setProfileImage([])}>Reset</Button>
            </Box>
          </Group>

          <TextInput
            placeholder={currentUser?.name ?? "Full Name"}
            label="Full Name"
            error={formState.name.length ? errorState.name : null}
            withAsterisk
            id="name"
            value={formState.name}
            onChange={handleInputChange}
          />

          <TextInput
            placeholder={currentUser?.email ?? "Account Email"}
            label="Account Email"
            id="email"
            value={formState.email}
            disabled
          />

          {!isOAuthUser && (
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
              passwordLabel="Update Password"
              confirmPasswordLabel="Confirm New Password"
            />
          )}

          <Group>
            <Button
              onClick={openAuthorizationModal}
              loading={isLoading}
              disabled={(!isSubmitEnabled && !profileImage.length) || isLoading}
            >
              Save
            </Button>

            <Button
              color="red"
              variant="outline"
              onClick={() => {
                setIsDeleting(true);
                openAuthorizationModal();
              }}
              loading={isLoading}
            >
              Delete Account
            </Button>
          </Group>
        </Box>

        <Modal
          centered
          opened={showAuthorizationModal}
          onClose={closeAuthorizationModal}
          title="Authorize Account Changes"
          styles={(theme) => ({
            body: {
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.md,
            },
          })}
        >
          <Text component="p">
            To{" "}
            {isDeleting
              ? "delete your account"
              : "confirm the changes you have made"}
            , please enter your confirmation input below.
            {isDeleting && (
              <>
                &nbsp;This action&nbsp;
                <Text
                  component="span"
                  color="red"
                >
                  cannot
                </Text>
                &nbsp;be undone and will{" "}
                <Text
                  component="span"
                  color="red"
                >
                  permanently delete all of your data.
                </Text>
              </>
            )}
          </Text>
          {isOAuthUser ? (
            <TextInput
              label={
                <Text component="p">
                  Please type&nbsp;
                  <Text
                    component="span"
                    fw={800}
                    variant="gradient"
                  >
                    {currentUser?.name}
                  </Text>
                  &nbsp;to confirm.
                </Text>
              }
              id="confirmation-oauth"
              value={confirmationState.input}
              onChange={handleConfirmationInputChange}
            />
          ) : (
            <PasswordInput
              label={
                <Text component="p">
                  Please type your&nbsp;
                  <Text
                    component="span"
                    fw={800}
                    variant="gradient"
                  >
                    current password
                  </Text>
                  &nbsp;to confirm.
                </Text>
              }
              id="confirmation-credential"
              value={confirmationState.input}
              onChange={handleConfirmationInputChange}
            />
          )}

          <Button
            fullWidth
            variant="light"
            onClick={isDeleting ? handleAccountDelete : handleAccountUpdate}
            loading={isLoading}
            disabled={isOAuthUser && !isConfirmEnabled}
          >
            Confirm Changes
          </Button>
        </Modal>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountUpdatePage;
