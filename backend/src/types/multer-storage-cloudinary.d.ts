declare module "multer-storage-cloudinary" {
  import type { StorageEngine } from "multer";

  function cloudinaryStorage(options: {
    cloudinary: unknown;
    params?: unknown;
    folder?: unknown;
    filename?: unknown;
    transformation?: unknown;
    type?: unknown;
    format?: unknown;
    allowedFormats?: unknown;
  }): StorageEngine;

  export = cloudinaryStorage;
}
