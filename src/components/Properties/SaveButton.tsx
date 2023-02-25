import {
  ActionIcon,
  ActionIconProps,
  Button,
  ButtonProps,
  useMantineTheme,
} from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { PropertyType, User } from "@prisma/client";
import { useRouter } from "next/router";
import { TbBookmark } from "react-icons/tb";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import { SavedListing, useAccountStore } from "@/data/stores";

import { Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

interface Props {
  listing: Listing;
  showLabel?: boolean;

  overwriteButtonProps?: ButtonProps;
  overwriteActionIconProps?: ActionIconProps;
}

export const SaveButton = ({
  listing,
  showLabel = false,
  overwriteButtonProps,
  overwriteActionIconProps,
}: Props) => {
  const { id: listingId, cluster_mappings, listing_type } = listing;
  const clusterId: string =
    cluster_mappings?.development?.[0] ?? cluster_mappings?.local?.[0] ?? "";

  const router = useRouter();
  const theme = useMantineTheme();
  const currentUser: User | null = useAccountStore.use.currentUser();
  const savedListings: SavedListing[] = useAccountStore.use.savedListings();

  // const useAccountSaveProperty = api.account.updateSaved.useMutation();
  const useAccountSaveProperty = api.account.saveProperty.useMutation();
  const useAccountUnsaveProperty = api.account.unsaveProperty.useMutation();

  const useAccountGetSaved = useAccountStore.use.getSavedListing();
  const isSaved = !!useAccountGetSaved(listingId);

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

    if (!currentUser) return;

    if (!isSaved) {
      const isRent: boolean = listing_type === ListingTypes[0];
      useAccountSaveProperty.mutate(
        {
          userId: currentUser.id,
          listingType: isRent ? PropertyType.RENT : PropertyType.SALE,
          listingId,
          clusterId,
        },
        {
          onSuccess(data) {
            logger("SaveButton.tsx line 35", { data, savedListings });
            useAccountStore.setState(() => ({ savedListings: data }));

            showNotification({
              onClick: handleOnToastClick,
              icon: <TbBookmark />,
              title: "Listing Saved!",
              message: "Click to view your saved listings",
            });
          },
        }
      );
    } else {
      useAccountUnsaveProperty.mutate(
        {
          userId: currentUser.id,
          listingId,
        },
        {
          onSuccess(data) {
            logger("SaveButton.tsx line 69", { data });
            useAccountStore.setState(() => ({ savedListings: data }));
          },
        }
      );
    }
  };

  const Icon = () => (
    <TbBookmark
      size={showLabel ? 16 : 25}
      color={showLabel || isSaved ? theme.fn.primaryColor() : "#fff"}
      fill={isSaved ? theme.colors.violet[5] : "none"}
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
        >
          {isSaved ? "Saved" : "Save"}
        </Button>
      ) : (
        <ActionIcon
          onClick={handleOnSave}
          disabled={!listing}
          {...overwriteActionIconProps}
        >
          <Icon />
        </ActionIcon>
      )}
    </Provider.RenderGuard>
  );
};

export default SaveButton;
