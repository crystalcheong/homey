import { Avatar, Text } from "@mantine/core";
import {
  Dropzone,
  DropzoneProps,
  FileWithPath,
  IMAGE_MIME_TYPE,
} from "@mantine/dropzone";

import { logger } from "@/utils/debug";

type Props = {
  placeholder: string | null;
  files: FileWithPath[];
  onDrop: DropzoneProps["onDrop"];
  sx?: DropzoneProps["sx"];
};

export const getImageUrl = (file: FileWithPath) => {
  const imageUrl = URL.createObjectURL(file);
  return imageUrl;
};

export const getImageBase64 = async (file: FileWithPath) => {
  const toBase64 = (file: FileWithPath) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  try {
    const base64Image = await toBase64(file);
    return base64Image;
  } catch (error) {
    console.error(error);
  }
};

const ImageUpload = ({ placeholder = null, files = [], onDrop, sx }: Props) => {
  logger("ImageUpload.tsx line 43", { placeholder });

  const getImagePreview = (imageUrl: string | null, name: string) => (
    <Avatar
      key={name}
      src={imageUrl ?? null}
      alt={name}
      styles={{
        root: {
          height: "100%",
          width: "100%",
        },
        image: {
          objectPosition: "center",
          height: "100%",
          width: "100%",
        },
      }}
    />
  );

  const previews = (files ?? []).map((file) =>
    getImagePreview(
      getImageUrl(file) ?? placeholder,
      file.name ?? "profileImage"
    )
  );

  return (
    <Dropzone
      accept={IMAGE_MIME_TYPE}
      onDrop={onDrop}
      maxFiles={1}
      maxSize={3 * 1024 ** 2}
      styles={{
        root: {
          borderRadius: "100%",
          width: 200,
          height: 200,
          overflow: "hidden",
          display: "flex",
          placeContent: "center",
          placeItems: "center",
          position: "relative",
        },
        inner: {
          borderRadius: "100%",
          position: "absolute",
          inset: 0,
          display: "flex",
          placeContent: "center",
          placeItems: "center",
        },
      }}
      sx={sx}
    >
      {files.length ? (
        previews
      ) : placeholder ? (
        getImagePreview(placeholder, "profilePlaceholder")
      ) : (
        <Text
          component="p"
          variant="gradient"
        >
          Upload profile image
        </Text>
      )}
    </Dropzone>
  );
};

export default ImageUpload;
