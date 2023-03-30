import { Box, Divider, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { privacyPolicy, TermPolicy, termsAndConditions } from "@/data/static";

import { Layout, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

import { logger } from "@/utils";

import ErrorClient from "~/assets/images/error-client.svg";

export const infoTypeContent: Record<
  string,
  {
    title: string;
    content: TermPolicy[];
  }
> = {
  terms: {
    title: "Terms and Conditions",
    content: termsAndConditions,
  },
  privacy: {
    title: "Privacy Policy",
    content: privacyPolicy,
  },
};

const InfoTypePage: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;

  logger("index.tsx line 13", { type });
  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (Object.keys(infoTypeContent).includes(paramType) && !!paramType.length) ??
    false;

  const typeContent = isValidType ? infoTypeContent[paramType] : null;

  return (
    <Layout.Base
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <Provider.RenderGuard
        renderIf={isValidType && !!typeContent}
        fallbackComponent={
          <UnknownState
            svgNode={<ErrorClient />}
            title="Info page not found"
            subtitle="Hey, you aren't supposed to be here"
          />
        }
      >
        <Box component="section">
          <Title
            order={1}
            size="h3"
            py="md"
            tt="capitalize"
          >
            {typeContent?.title}
          </Title>

          <Divider />

          {(typeContent?.content ?? []).map(({ title, content }, idx) => (
            <Box
              key={`terms-${idx}`}
              component="article"
            >
              <Title
                size="h5"
                py="md"
                tt="capitalize"
                color="dimmed"
              >
                {title}
              </Title>
              <Text>{content}</Text>
            </Box>
          ))}
        </Box>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default InfoTypePage;
