import {
  ActionIcon,
  ActionIconProps,
  Button,
  ButtonProps,
  DefaultProps,
  useMantineTheme,
} from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { PropertyType, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { IconBaseProps } from "react-icons";
import { TbBookmark } from "react-icons/tb";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import {
  getStringifiedListing,
  SavedListing,
  useAccountStore,
} from "@/data/stores";

import { Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

interface Props extends DefaultProps {
  listing: Listing;
  showLabel?: boolean;

  overwriteIconProps?: IconBaseProps;
  overwriteButtonProps?: ButtonProps;
  overwriteActionIconProps?: ActionIconProps;
}

export const SaveButton = ({
  listing,
  showLabel = false,
  overwriteIconProps,
  overwriteButtonProps,
  overwriteActionIconProps,
  ...rest
}: Props) => {
  const { id: listingId, cluster_mappings, listing_type } = listing;
  const clusterId: string =
    cluster_mappings?.development?.[0] ?? cluster_mappings?.local?.[0] ?? "";

  const router = useRouter();
  const theme = useMantineTheme();
  const currentUser: User | null = useAccountStore.use.currentUser();
  const savedListings: SavedListing[] = useAccountStore.use.savedListings();

  const useAccountSaveProperty = api.accountV2.saveProperty.useMutation();
  const useAccountUnsaveProperty = api.accountV2.unsaveProperty.useMutation();

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

  const handleOnSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (!currentUser || !listing) return;
    setIsSaved(!isSaved);

    const isRent: boolean = listing_type === ListingTypes[0];
    const baseParams = {
      userId: currentUser.id,
      listingId,
    };

    const saveParams = {
      ...baseParams,
      listingType: isRent ? PropertyType.rent : PropertyType.sale,
      clusterId,
      stringifiedListing: getStringifiedListing(listing),
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

    if (!isSaved) {
      useAccountSaveProperty.mutate(saveParams, {
        onSuccess: (data: SavedListing[]) => {
          onSave(data);
        },
      });
    } else {
      useAccountUnsaveProperty.mutate(baseParams, {
        onSuccess: (data: SavedListing[]) => {
          onSave(data);
        },
      });
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
          disabled={!listing}
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
          disabled={!listing}
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
