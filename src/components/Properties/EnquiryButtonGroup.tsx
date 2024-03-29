import {
  ActionIcon,
  ActionIconProps,
  Button,
  ButtonProps,
  Group,
  GroupProps,
  useMantineTheme,
} from "@mantine/core";
import { IconBaseProps } from "react-icons";

import { NinetyNine } from "@/data/clients/ninetyNine";

import { EnquiryIcons, Listing } from "@/types/ninetyNine";

interface Props {
  listing: Listing;
  hideLabels?: boolean;

  overwriteIconProps?: IconBaseProps;
  overwriteGroupProps?: GroupProps;
  overwriteButtonProps?: ButtonProps;
  overwriteActionIconProps?: ActionIconProps;
}

export const EnquiryButtonGroup = ({
  listing,
  hideLabels = false,
  overwriteIconProps,
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

  const listingRelativeLink = NinetyNine.getSourceHref(listing);

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
            {...overwriteIconProps}
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
