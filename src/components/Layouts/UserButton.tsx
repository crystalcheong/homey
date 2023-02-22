import {
  Avatar,
  Box,
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { TbChevronRight } from "react-icons/tb";

import { getNameInitials } from "@/utils/helpers";

interface Props
  extends ComponentPropsWithoutRef<"button">,
    UnstyledButtonProps {
  image?: string;
  name: string;
  email?: string;
  icon?: ReactNode;
  hideIcon?: boolean;
}

export const UserButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      image,
      name = "Account",
      email,
      icon,
      hideIcon = false,
      sx,
      ...others
    }: Props,
    ref
  ) => (
    <UnstyledButton
      ref={ref}
      sx={{
        width: "100%",
        ...sx,
      }}
      {...others}
    >
      <Group position="apart">
        <Avatar
          src={image ?? null}
          alt={name}
          radius="xl"
          size={40}
        >
          {getNameInitials(name)}
        </Avatar>
        <Box style={{ flex: 1 }}>
          <Text
            size="sm"
            weight={500}
          >
            {name}
          </Text>

          <Text
            color="dimmed"
            size="xs"
          >
            {email}
          </Text>
        </Box>
        {!hideIcon && (icon || <TbChevronRight size={16} />)}
      </Group>
    </UnstyledButton>
  )
);

export default UserButton;
