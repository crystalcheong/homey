import { UploadApiOptions, v2 } from "cloudinary";

import { env } from "@/env.mjs";
import { logger } from "@/utils/debug";

export class Cloudinary {
  private sdk: typeof v2;

  constructor() {
    this.sdk = v2;
    this.sdk.config({
      cloud_name: env.CLOUDINARY_NAME,
      api_key: env.CLOUDINARY_KEY,
      api_secret: env.CLOUDINARY_SECRET,
    });
  }

  uploadImage = async (rawImage: string, publicId: string) => {
    if (!rawImage.length || !publicId.length) return null;

    logger("cloudinary.ts line 22", {
      rawImage,
      publicId,
      isValid: !rawImage.length || !publicId.length,
    });

    const imageOptions = {
      width: 400,
      height: 300,
      crop: "fill",
    };
    const uploadOptions: UploadApiOptions = {
      public_id: publicId,
      folder: "user-avatar",
      // upload_preset: "user-avatar",
      ...imageOptions,
    };

    const uploadQuery = await this.sdk.uploader.upload(
      rawImage,
      uploadOptions,
      (err, res) => {
        logger("cloudinary.ts line 47", { err, res });
      }
    );

    logger("cloudinary.ts line 38", {
      rawImage,
      publicId,
      uploadQuery,
    });

    const uploadUrl: string = (await uploadQuery.secure_url) ?? "";
    if (!uploadUrl.length) return null;

    return uploadUrl;
  };
}
