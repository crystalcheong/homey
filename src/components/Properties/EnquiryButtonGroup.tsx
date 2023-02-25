import {
  ActionIcon,
  ActionIconProps,
  Button,
  ButtonProps,
  Group,
  GroupProps,
  useMantineTheme,
} from "@mantine/core";

import { Listing } from "@/data/clients/ninetyNine";

import { EnquiryIcons } from "@/components/Properties/Card";

interface Props {
  listing: Listing;
  hideLabels?: boolean;

  overwriteGroupProps?: GroupProps;
  overwriteButtonProps?: ButtonProps;
  overwriteActionIconProps?: ActionIconProps;
}

export const EnquiryButtonGroup = ({
  listing,
  hideLabels = false,
  overwriteGroupProps,
  overwriteButtonProps,
  overwriteActionIconProps,
}: Props) => {
  const theme = useMantineTheme();

  const getEnquiryLinks = (
    user: Listing["user"],
    listingRelativeLink: string
  ) =>
    user?.phone
      ? {
          call: `tel:${user?.phone}`,
          whatsapp: `https://api.whatsapp.com/send?phone=${user?.phone}&text=Hi ${user?.name}! I would like to check the availability of the following listing. ${listingRelativeLink}`,
        }
      : {};

  const { listing_type: type, id, cluster_mappings } = listing;
  const clusterId: string =
    cluster_mappings?.development?.[0] ?? cluster_mappings?.local?.[0] ?? "";
  const listingRelativeLink = `/property/${type}/${id}?clusterId=${clusterId}`;

  return (
    <Group {...overwriteGroupProps}>
      {Object.entries(
        getEnquiryLinks(listing?.user ?? {}, listingRelativeLink)
      ).map(([mode, contactLink]) => {
        const EnquiryIcon = EnquiryIcons[mode];
        const Icon = () => (
          <EnquiryIcon
            size={16}
            color={theme.fn.primaryColor()}
          />
        );

        return hideLabels ? (
          <ActionIcon
            key={`enquiryMode-${mode}`}
            onClick={(e) => {
              e.preventDefault();
              window.open(contactLink, "_blank");
            }}
            disabled={!listing}
            {...overwriteActionIconProps}
          >
            <Icon />
          </ActionIcon>
        ) : (
          <Button
            // compact
            key={`enquiryMode-${mode}`}
            variant="light"
            onClick={(e) => {
              e.preventDefault();
              window.open(contactLink, "_blank");
            }}
            disabled={!listing}
            leftIcon={<Icon />}
            sx={{
              textTransform: "capitalize",
            }}
            {...overwriteButtonProps}
          >
            {mode}
          </Button>
        );
      })}
    </Group>
  );
};

export default EnquiryButtonGroup;
