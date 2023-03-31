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

    const imageOptions = {
      width: 400,
      height: 300,
      crop: "fill",
    };
    const uploadOptions: UploadApiOptions = {
      public_id: publicId,
      folder: "user-avatar",
      ...imageOptions,
    };

    const uploadQuery = await this.sdk.uploader.upload(
      rawImage,
      uploadOptions,
      (err, res) =>
        logger("[cloudinary.ts:39]/uploadImage", {
          err,
          publicId: res?.public_id,
        })
    );

    const uploadUrl: string = (await uploadQuery.secure_url) ?? "";
    if (!uploadUrl.length) return null;

    return uploadUrl;
  };

  deleteImage = async (publicId: string) => {
    if (!publicId.length) return null;

    const destroyQuery = await this.sdk.uploader.destroy(
      publicId,
      undefined,
      (err, res) =>
        logger("[cloudinary.ts:58]/deleteImage", {
          err,
          res,
        })
    );

    return destroyQuery;
  };
}
