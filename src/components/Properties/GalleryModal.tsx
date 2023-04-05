import { Carousel } from "@mantine/carousel";
import { Image, Modal, ModalProps, useMantineTheme } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useRef } from "react";
const GalleryImageCaption = dynamic(
  () => import("@/components/Properties/GalleryImageCaption")
);

import { useIsMobile } from "@/utils/dom";

import { Listing, ListingPhoto } from "@/types/ninetyNine";

interface Props extends ModalProps {
  photos: Listing["photos"];
  activePhoto?: Listing["photos"][number];
  dispatchState: Dispatch<SetStateAction<ListingPhoto | undefined>>;
}

const GalleryModal = ({
  photos,
  activePhoto,
  opened,
  dispatchState,
  onClose,
}: Props) => {
  const theme = useMantineTheme();

  const isMobile: boolean = useIsMobile(theme);
  const isDark: boolean = theme.colorScheme === "dark" ?? false;

  const autoplay = useRef(Autoplay({ delay: 2000 }));

  return (
    <Modal
      centered
      opened={opened}
      onClose={onClose}
      overlayColor={isDark ? theme.colors.dark[9] : theme.colors.gray[2]}
      overlayOpacity={0.55}
      overlayBlur={3}
      transition="fade"
      transitionDuration={600}
      transitionTimingFunction="ease"
      fullScreen
      styles={{
        header: {
          position: "relative",
          top: "2.5rem",
          zIndex: 50,
        },
      }}
    >
      <Image
        height="75vh"
        fit={isMobile ? "cover" : "contain"}
        src={activePhoto?.url ?? null}
        alt={activePhoto?.category}
        sx={{
          position: "relative",
        }}
        caption={
          <GalleryImageCaption>{activePhoto?.category}</GalleryImageCaption>
        }
      />

      <Carousel
        withIndicators
        loop
        align="start"
        height={100}
        slideSize="33.33%"
        slideGap="sm"
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        breakpoints={[
          { maxWidth: "md", slideSize: "50%", slideGap: "sm" },
          { maxWidth: "sm", slideSize: "100%", slideGap: 0 },
        ]}
        styles={{
          indicator: {
            width: 12,
            height: 4,
            transition: "width 250ms ease",

            "&[data-active]": {
              width: 40,
            },
          },
        }}
      >
        {photos.map((photo) => (
          <Carousel.Slide key={`gallerySlide-${photo.id}`}>
            <Image
              height={100}
              fit="cover"
              src={photo.url}
              onClick={() => dispatchState(photo)}
              alt={photo.category}
              sx={{
                position: "relative",
              }}
              caption={
                <GalleryImageCaption>{photo.category}</GalleryImageCaption>
              }
            />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Modal>
  );
};

export default GalleryModal;
