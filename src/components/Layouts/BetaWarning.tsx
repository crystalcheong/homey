import { Alert } from "@mantine/core";
import { useState } from "react";
import { TbAlertCircle } from "react-icons/tb";

import { Provider } from "@/components";

const BetaWarning = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const handleOnClose = () => {
    setIsVisible(false);
  };
  return (
    <Provider.RenderGuard renderIf={isVisible}>
      <Alert
        icon={<TbAlertCircle size={16} />}
        title="Work In Progress"
        color="yellow"
        withCloseButton
        onClose={handleOnClose}
        mb={30}
      >
        This app is a preview and should not be considered as the final product
      </Alert>
    </Provider.RenderGuard>
  );
};

export default BetaWarning;
