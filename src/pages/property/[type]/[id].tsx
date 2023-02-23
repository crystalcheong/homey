import { Button, Group, Image, Title } from "@mantine/core";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";
import superjson from "superjson";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import { EnquiryIcons, getEnquiryLinks } from "@/components/Properties";

import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, type, clusterId } = context.query;

  const paramId: string = (id ?? "").toString();
  const isValidId: boolean = !!paramId.length ?? false;

  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (ListingTypes.includes(paramType) || !!paramType.length) ?? false;

  const paramClusterId: string = (clusterId ?? "").toString();
  const isValidClusterId: boolean = !!paramClusterId.length ?? false;

  const isValidProperty: boolean = isValidId && isValidType && isValidClusterId;

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {
      session: null,
      prisma: prisma,
    },
    transformer: superjson,
  });

  await ssg.ninetyNine.getClusterListing.prefetch({
    listingType: paramType,
    listingId: paramId,
    clusterId: paramClusterId,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: paramId,
      type: paramType,
      clusterId: paramClusterId,
      isValidProperty,
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const PropertyPage = ({ id, type, clusterId, isValidProperty }: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const listing: Listing | null = useNinetyNineStore.use.getListing()(type, id);

  api.ninetyNine.getClusterListing.useQuery(
    {
      listingType: id,
      listingId: type,
      clusterId: clusterId,
    },
    {
      enabled: !listing && isValidProperty && isMounted,
      onSuccess(data) {
        logger("[id].tsx line 45/onSuccess", { data, clusterId, id, type });

        // if (!data) {
        //   router.push(`${router.basePath}/property/${type}`, undefined, {
        //     scroll: true,
        //   });
        // }
        useNinetyNineStore.setState(() => ({ currentListing: data }));
      },
    }
  );

  /**
   * @see https://nextjs.org/docs/messages/react-hydration-error
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isValidProperty && isMounted}>
        <Image
          src={listing?.photo_url}
          height={160}
          alt={id}
          fit="cover"
          withPlaceholder
        />
        <Title
          order={1}
          size="h3"
        >
          {listing?.attributes?.bedrooms_formatted}&nbsp;
          {listing?.sub_category_formatted}
          &nbsp;in&nbsp;{listing?.address_name}
        </Title>

        <Group>
          {Object.entries(
            getEnquiryLinks(
              listing?.user ?? {},
              `/property/${type}/${id}?clusterId=${clusterId}`
            )
          ).map(([mode, contactLink]) => {
            const EnquiryIcon = EnquiryIcons[mode];
            return (
              <Button
                key={mode}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(contactLink, "_blank");
                }}
                compact
                variant="light"
                leftIcon={<EnquiryIcon />}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </Button>
            );
          })}
        </Group>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default PropertyPage;
