import {
  Badge,
  Box,
  Card as MCard,
  CardProps,
  Divider,
  Group,
  Image,
  Progress,
  Skeleton,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { TbWalk } from "react-icons/tb";

import { ProjectLaunch } from "@/data/clients/ninetyNine";

import { RenderGuard } from "@/components/Providers";

interface Props extends Partial<CardProps> {
  launch: ProjectLaunch;
  isLoading?: boolean;
}

const LaunchCard = ({
  launch,
  isLoading = false,
  children,
  ...rest
}: Props) => {
  const theme = useMantineTheme();

  const {
    development_id: id,
    name,
    location,
    details,
    photo_url,
    percentage_sold,
    formatted_tags,
    within_distance_from_query,
  } = launch;

  const isPlaceholder = !Object.keys(launch).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;

  return (
    <MCard
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      {...rest}
    >
      <MCard.Section>
        <Progress
          size="xs"
          value={percentage_sold ?? 0}
        />

        {(formatted_tags ?? []).map((tag) => (
          <Badge
            key={`${id}-${name}-${tag?.color}`}
            color="pink"
            radius="sm"
            variant="filled"
            tt="uppercase"
            styles={(theme) => ({
              root: {
                background: tag?.background_color,
                color: tag?.color,

                position: "absolute",
                top: theme.spacing.xs,
                left: theme.spacing.xs,
                zIndex: 10,
              },
            })}
          >
            {tag?.text}
          </Badge>
        ))}
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
          align="start"
          mt="md"
          mb="xs"
          spacing="xs"
        >
          <Title
            order={3}
            size="h4"
            truncate
          >
            {name}
            <br />
            <Text
              component="span"
              weight={500}
              fz="sm"
            >
              {details}
            </Text>
          </Title>
        </Group>
      </Skeleton>

      <Skeleton visible={isSkeleton}>
        <Group
          position="apart"
          noWrap
        >
          <Group
            spacing="xs"
            noWrap
          >
            <Divider
              orientation="vertical"
              size="lg"
              color={theme.primaryColor}
            />
            <Box>
              <Text
                component="p"
                weight={500}
                lh={0}
                p={0}
              >
                {within_distance_from_query?.closest_mrt?.title ?? location}
              </Text>
              <RenderGuard
                renderIf={
                  !!Object.keys(within_distance_from_query ?? {}).length
                }
              >
                <Text
                  color="dimmed"
                  component="span"
                  weight={400}
                  lh={0}
                  display="inline-block"
                  sx={{
                    display: "inline-flex",
                    flexDirection: "row",
                    placeContent: "center",
                    placeItems: "center",
                  }}
                >
                  <TbWalk size={20} />
                  &nbsp;
                  {
                    within_distance_from_query?.closest_mrt
                      ?.walking_time_in_mins
                  }{" "}
                  min
                </Text>
              </RenderGuard>
            </Box>
          </Group>

          <Text
            fw="bold"
            ta="center"
            fz="xl"
            display="inline-block"
            sx={{
              width: "min-content",
            }}
          >
            {percentage_sold ?? 0}%&nbsp;
            <Text
              component="span"
              tt="uppercase"
              fw="normal"
              fz="sm"
              display="block"
            >
              sold
            </Text>
          </Text>
        </Group>
      </Skeleton>

      {children}
    </MCard>
  );
};

export default LaunchCard;
