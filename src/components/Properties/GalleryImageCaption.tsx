import { Text, TextProps, useMantineTheme } from "@mantine/core";

export const GalleryImageCaption = ({ children, ...rest }: TextProps) => {
  const theme = useMantineTheme();
  return (
    <Text
      sx={{
        position: "absolute",
        bottom: "0.5em",
        left: "0.5em",
        padding: "0.2em",

        background: `rgba(0,0,0,.4)`,
        color: theme.white,
        borderRadius: theme.radius.md,
      }}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default GalleryImageCaption;
