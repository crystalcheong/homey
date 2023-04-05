import {
  Group,
  PasswordInput,
  PasswordInputProps,
  Text,
  Transition,
} from "@mantine/core";
import Link from "next/link";
import { ChangeEventHandler, Fragment, ReactNode } from "react";

import { PasswordFormState } from "@/types/account";

interface Props {
  formState: PasswordFormState;
  errorState: PasswordFormState;
  onChange?: ChangeEventHandler<HTMLInputElement>;

  passwordProps?: PasswordInputProps;
  passwordLabel?: string | ReactNode;
  confirmPasswordLabel?: string | ReactNode;
  confirmPasswordProps?: PasswordInputProps;

  showForgotPassword?: boolean;
  showConfirmPassword?: boolean;
}

const AuthPassword = ({
  formState,
  errorState,
  onChange,
  passwordProps,
  passwordLabel,
  confirmPasswordLabel,
  confirmPasswordProps,
  showForgotPassword = false,
  showConfirmPassword = true,
}: Props) => {
  return (
    <Fragment>
      <PasswordInput
        value={formState.password}
        onChange={onChange}
        error={errorState.password}
        label={
          <Group position="apart">
            <Text>{passwordLabel || "Password"}</Text>
            {showForgotPassword && (
              <Text
                component={Link}
                href="/account/auth/forgot-password"
                variant="gradient"
              >
                Forgot password?
              </Text>
            )}
          </Group>
        }
        id="password"
        placeholder="Password"
        disabled={showConfirmPassword && !!formState.confirmPassword.length}
        sx={{
          label: {
            width: "100%",
          },
        }}
        {...passwordProps}
      />

      <Transition
        transition="slide-down"
        mounted={!!formState.password.length && showConfirmPassword}
      >
        {(transitionStyles) => (
          <PasswordInput
            value={formState.confirmPassword}
            onChange={onChange}
            error={
              formState.confirmPassword.length
                ? errorState.confirmPassword
                : null
            }
            label={confirmPasswordLabel || "Confirm Password"}
            id="confirmPassword"
            placeholder="Confirm Password"
            style={transitionStyles}
            {...confirmPasswordProps}
          />
        )}
      </Transition>
    </Fragment>
  );
};

export default AuthPassword;
