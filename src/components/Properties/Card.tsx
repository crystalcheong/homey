import {
  ActionIcon,
  Button,
  Card as MCard,
  CardProps,
  Group,
  Image,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconType } from "react-icons";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { TbBookmark } from "react-icons/tb";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

export const EnquiryTypes: string[] = ["call", "whatsapp"];
export type EnquiryType = (typeof EnquiryTypes)[number];
export const EnquiryIcons: Record<EnquiryType, IconType> = {
  [EnquiryTypes[0]]: FaPhoneAlt,
  [EnquiryTypes[1]]: FaWhatsapp,
};

interface Props extends Partial<CardProps> {
  listing: Listing;
  isLoading?: boolean;
}

const PriceTypes: string[] = ["/month", ""];
export type PriceType = (typeof PriceTypes)[number];
const PriceListingTypes: {
  [key in ListingType]: PriceType;
} = ListingTypes.reduce(
  (searchMap = {}, type: string, idx: number) => ({
    ...searchMap,
    [type]: PriceTypes[idx],
  }),
  {}
);

export const getEnquiryLinks = (
  user: Listing["user"],
  listingRelativeLink: string
) =>
  user?.phone
    ? {
        call: `tel:${user?.phone}`,
        whatsapp: `https://api.whatsapp.com/send?phone=${user?.phone}&text=Hi ${user?.name}! I would like to check the availability of the following listing. ${listingRelativeLink}`,
      }
    : {};

export const Card = ({
  listing,
  children,
  isLoading = false,
  ...rest
}: Props) => {
  const {
    id,
    listing_type,
    photo_url,
    attributes,
    main_category,
    address_name,
    cluster_mappings,
    // enquiry_flags,
    user,
  } = listing;

  const router = useRouter();

  const isPlaceholder = !Object.keys(listing).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;
  const strPrice = `${attributes?.price_formatted ?? `$-.--`} SGD ${
    PriceListingTypes[listing_type]
  }`;

  const clusterId: string = cluster_mappings?.development?.[0] ?? "";
  const listingRelativeLink = `/property/${listing_type}/${id}?clusterId=${clusterId}`;
  // const availableEnquiryTypes: string[] =
  //   Object.entries(enquiry_flags ?? {})
  //     .filter(([k, v]) => !!v && EnquiryTypes.some((type) => k.includes(type)))
  //     .map(([k]) => EnquiryTypes.find((t) => k.includes(t)) ?? "") ?? [];

  return (
    <MCard
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      component={Link}
      href={listingRelativeLink}
      // onClick={() => {
      //   router.push({
      //     pathname: `/property/${listing_type}/${id}?clusterId=${clusterId}`,
      //   }, undefined, { scroll: true })
      // }}
      {...rest}
    >
      <MCard.Section>
        <Image
          src={photo_url}
          height={160}
          alt={id}
          fit="cover"
          withPlaceholder
        />
      </MCard.Section>

      <Skeleton visible={isSkeleton}>
        <Group
          position="apart"
          mt="md"
          mb="xs"
          spacing="xs"
        >
          <Title
            order={1}
            size="h4"
            truncate
            sx={
              {
                // maxWidth: isTablet ? "auto" : "180px",
              }
            }
          >
            {address_name}
          </Title>

          {/* <Badge
            color="pink"
            variant="light"
          >
            {listing_type}
          </Badge> */}
        </Group>
      </Skeleton>

      <Skeleton visible={isSkeleton}>
        <Text tt="capitalize">
          <Text
            tt="uppercase"
            component="span"
          >
            {main_category}
          </Text>
          &nbsp;&middot;&nbsp;
          {attributes?.bedrooms_formatted}
        </Text>
        <Text
          component="p"
          weight={500}
        >
          {strPrice}
        </Text>
      </Skeleton>

      {children}

      <Group
        position="apart"
        sx={{
          position: "relative",
          zIndex: 100,
        }}
      >
        {Object.entries(getEnquiryLinks(user, listingRelativeLink)).map(
          ([k, v]) => {
            const EnquiryIcon = EnquiryIcons[k];
            return (
              <Button
                key={k}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(v, "_blank");
                }}
                compact
                variant="light"
                leftIcon={<EnquiryIcon />}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                {k}
              </Button>
            );
          }
        )}
        <ActionIcon
          onClick={(e) => {
            e.preventDefault();
            showNotification({
              onClick: () => {
                cleanNotifications();
                router.push(
                  {
                    pathname: `/account/saved`,
                  },
                  undefined,
                  { scroll: true }
                );
              },
              icon: <TbBookmark />,
              title: "Listing Saved!",
              message: "Click to view your saved listings",
            });
          }}
        >
          <TbBookmark size={40} />
        </ActionIcon>
      </Group>
    </MCard>
  );
};

export default Card;
