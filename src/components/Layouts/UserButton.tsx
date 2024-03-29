import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { TbChevronRight, TbCircleCheckFilled } from "react-icons/tb";

import { getNameInitials } from "@/utils";

import { UserAccount } from "@/types/account";

interface Props
  extends ComponentPropsWithoutRef<"button">,
    UnstyledButtonProps {
  user: UserAccount;
  icon?: ReactNode;
  hideIcon?: boolean;
}

export const UserButton = forwardRef<HTMLButtonElement, Props>(
  ({ user, icon, hideIcon = false, sx, ...others }: Props, ref) => {
    const isAgentUser: boolean = !!(user.propertyAgent ?? []).length ?? false;
    const isVerifiedAgentUser: boolean =
      isAgentUser && (user?.propertyAgent?.[0]?.isVerified ?? false);

    return (
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
            src={user.image}
            alt={`${user.name}`}
            radius="xl"
            size={40}
            color="primary"
            styles={{
              image: {
                objectPosition: "center",
              },
            }}
          >
            {getNameInitials(user.name ?? "")}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text
              size="sm"
              weight={500}
            >
              {user.name}
            </Text>

            {isAgentUser && (
              <Badge
                pr={3}
                size="xs"
                variant="outline"
                color={isVerifiedAgentUser ? "primary" : "gray"}
                rightSection={
                  <ActionIcon
                    component="span"
                    size="xs"
                    radius="xl"
                    variant="transparent"
                    color={isVerifiedAgentUser ? "primary" : "gray"}
                  >
                    <TbCircleCheckFilled
                      size={12}
                      color={isVerifiedAgentUser ? "primary" : "gray"}
                    />
                  </ActionIcon>
                }
              >
                {isVerifiedAgentUser ? "Verified" : "Unverified"}
              </Badge>
            )}
          </Box>
          {!hideIcon && (icon || <TbChevronRight size={16} />)}
        </Group>
      </UnstyledButton>
    );
  }
);

export default UserButton;
