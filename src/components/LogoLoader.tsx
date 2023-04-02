import { LoadingOverlay, LoadingOverlayProps } from "@mantine/core";
import Image from "next/image";

import HomeyLoader from "~/assets/brand/homey.gif";

const LogoLoader = ({ visible, ...rest }: LoadingOverlayProps) => {
  return (
    <LoadingOverlay
      loader={
        <Image
          src={HomeyLoader}
          alt="loader"
          height={150}
          width={150}
        />
      }
      visible={visible}
      overlayBlur={2}
      overlayOpacity={0.3}
      {...rest}
    />
  );
};

export default LogoLoader;
