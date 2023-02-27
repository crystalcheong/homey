import {
  Group,
  PasswordInput,
  PasswordInputProps,
  Text,
  Transition,
} from "@mantine/core";
import Link from "next/link";
import { ChangeEventHandler, Fragment } from "react";

export interface PasswordFormState {
  password: string;
  confirmPassword: string;
}

interface Props {
  formState: PasswordFormState;
  errorState: PasswordFormState;
  onChange?: ChangeEventHandler<HTMLInputElement>;

  passwordProps?: PasswordInputProps;
  passwordLabel?: string;
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
            error={errorState.confirmPassword}
            label="Confirm Password"
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
