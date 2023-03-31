import {
  ActionIcon,
  ActionIconProps,
  Button,
  ButtonProps,
  DefaultProps,
  useMantineTheme,
} from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { PropertyListing, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { IconBaseProps } from "react-icons";
import { TbBookmark } from "react-icons/tb";

import { Listing, NinetyNine } from "@/data/clients/ninetyNine";
import { SavedListing, useAccountStore } from "@/data/stores";

import { Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

interface Props extends DefaultProps {
  listing: Listing;
  showLabel?: boolean;
  disabled?: boolean;

  overwriteIconProps?: IconBaseProps;
  overwriteButtonProps?: ButtonProps;
  overwriteActionIconProps?: ActionIconProps;
}

export const SaveButton = ({
  listing,
  showLabel = false,
  disabled = false,
  overwriteIconProps,
  overwriteButtonProps,
  overwriteActionIconProps,
  ...rest
}: Props) => {
  const { id: listingId } = listing;

  const router = useRouter();
  const theme = useMantineTheme();
  const currentUser: User | null = useAccountStore.use.currentUser();
  const savedListings: SavedListing[] = useAccountStore.use.savedListings();

  // const useAccountSavePropertyV1 = api.account.savePropertyV1.useMutation();
  const useAccountSaveProperty = api.account.saveProperty.useMutation();

  // const useAccountUnsaveProperty = api.account.unsavePropertyV1.useMutation();
  const useAccountUnsaveProperty = api.account.unsaveProperty.useMutation();

  const useAccountGetSaved = useAccountStore.use.getSavedListing()(listingId);
  const [isSaved, setIsSaved] = useState<boolean>(!!useAccountGetSaved);

  const handleOnToastClick = () => {
    if (!currentUser) return;

    cleanNotifications();
    router.push(
      {
        pathname: `/account/saved`,
      },
      undefined,
      { scroll: true }
    );
  };

  const handleOnSave = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!currentUser || !listing) return;
    setIsSaved(!isSaved);

    const baseParams = {
      userId: currentUser.id,
    };

    const property: PropertyListing =
      NinetyNine.convertSourceToListing(listing);
    const saveParams = {
      ...baseParams,
      property: {
        id: property.id,
        source: property.source,
        type: property.type,
        isAvailable: property.isAvailable ?? true,
        category: property.category,
        photoUrl: property.photoUrl ?? undefined,
        agentId: property.agentId ?? undefined,
        href: property.href,
      },
      stringifiedSnapshot: NinetyNine.stringifySnapshot(listing),
    };

    logger("SaveButton.tsx line 92", { saveParams });

    const onSave = (data: SavedListing[]) => {
      logger("SaveButton.tsx line 35", { data, savedListings });
      useAccountStore.setState(() => ({ savedListings: data }));

      if (!isSaved) {
        showNotification({
          onClick: handleOnToastClick,
          icon: <TbBookmark />,
          title: "Listing Saved!",
          message: "Click to view your saved listings",
        });
      }
    };

    try {
      if (!isSaved) {
        await useAccountSaveProperty.mutateAsync(saveParams, {
          onSuccess: (data: SavedListing[]) => onSave(data),
        });
      } else {
        useAccountUnsaveProperty.mutate(
          {
            ...baseParams,
            listingId: property.id,
          },
          {
            onSuccess: (data: SavedListing[]) => onSave(data),
          }
        );
      }
    } catch (error) {
      console.error(error);
      setIsSaved(false);
      showNotification({
        icon: <TbBookmark color={theme.colors.red[4]} />,
        title: "Not Saved",
        message: "Oh no, unable to save listing",
      });
      return;
    }
  };

  const Icon = () => (
    <TbBookmark
      size={16}
      color={showLabel || isSaved ? theme.fn.primaryColor() : "#fff"}
      fill={isSaved ? theme.colors.violet[5] : "none"}
      {...overwriteIconProps}
    />
  );

  return (
    <Provider.RenderGuard renderIf={!!currentUser || !listing}>
      {showLabel ? (
        <Button
          compact
          variant="outline"
          onClick={handleOnSave}
          disabled={!listing || disabled}
          leftIcon={<Icon />}
          {...overwriteButtonProps}
          {...rest}
        >
          {isSaved ? "Saved" : "Save"}
        </Button>
      ) : (
        <ActionIcon
          variant="transparent"
          onClick={handleOnSave}
          disabled={!listing || disabled}
          {...overwriteActionIconProps}
          {...rest}
        >
          <Icon />
        </ActionIcon>
      )}
    </Provider.RenderGuard>
  );
};

export default SaveButton;
