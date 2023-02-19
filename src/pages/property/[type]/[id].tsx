import { Box, Title } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";

import { logger } from "@/utils/debug";

const PropertyPage = () => {
  const router = useRouter();
  const { id, type } = router.query;

  const paramId: string = (id ?? "").toString();
  const isValidId: boolean = !!paramId.length ?? false;

  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (ListingTypes.includes(paramType) || !!paramType.length) ?? false;

  const listing: Listing | null = useNinetyNineStore.use.getListing()(
    paramType,
    paramId
  );

  const isValidProperty: boolean = isValidId && isValidType && !!listing;

  logger("[id].tsx line 12", {
    type,
    id,
    listing,
  });
  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isValidProperty}>
        <Box component="section">
          <Title
            order={1}
            size="h3"
          >
            {listing?.attributes?.bedrooms_formatted}&nbsp;
            {listing?.sub_category_formatted}
            &nbsp;in&nbsp;{listing?.address_name}
          </Title>
        </Box>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default PropertyPage;
