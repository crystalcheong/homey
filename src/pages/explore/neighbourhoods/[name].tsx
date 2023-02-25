import { useRouter } from "next/router";
import React from "react";

import { useNinetyNineStore } from "@/data/stores";

import { Layout } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const Neighbourhood = () => {
  const router = useRouter();
  const { name } = router.query;

  const neighbourhoods = useNinetyNineStore.use.neighbourhoods();

  const paramName: string = (name ?? "").toString();
  const isValidName: boolean =
    (Object.keys(neighbourhoods).includes(paramName) || !!paramName.length) ??
    false;

  const { data: neighbourhoodData } = api.ninetyNine.getNeighbourhood.useQuery(
    {
      name: paramName,
    },
    {
      enabled: isValidName,
    }
  );

  logger("[name].tsx line 26", { neighbourhoodData });

  return (
    <Layout.Base>
      <div>{name}</div>
    </Layout.Base>
  );
};

export default Neighbourhood;
