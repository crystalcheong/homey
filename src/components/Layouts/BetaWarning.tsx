import { Alert, AlertProps, Transition, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { TbAlertCircle } from "react-icons/tb";

interface Props {
  title?: AlertProps["title"];
  content?: AlertProps["children"];
}

const BetaWarning = ({ title, content }: Props) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark" ?? false;

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const handleOnClose = () => {
    setIsVisible(false);
  };
  return (
    <Transition
      mounted={isVisible}
      transition="fade"
      duration={400}
      timingFunction="ease"
    >
      {(styles) => (
        <Alert
          icon={<TbAlertCircle size={16} />}
          title={title ?? "Work In Progress"}
          color={isDark ? "yellow" : "yellow.7"}
          withCloseButton
          onClose={handleOnClose}
          mb={30}
          style={styles}
        >
          {content ??
            "This app is a preview and should not be considered as the final product"}
        </Alert>
      )}
    </Transition>
  );
};

export default BetaWarning;
