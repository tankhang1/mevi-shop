import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "node:stream";
import { currentAuthContext, requireRole } from "../lib/auth";
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();
const imageEditors = requireRole("admin", "agency");
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 8 * 1024 * 1024;

router.post(
  "/storage/uploads/request-url",
  imageEditors,
  async (req, res): Promise<void> => {
    const auth = currentAuthContext(res);
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    if (
      parsed.data.size > maxImageBytes ||
      !allowedImageTypes.has(parsed.data.contentType)
    ) {
      res.status(400).json({
        error: "Use a JPEG, PNG, or WebP image smaller than 8 MB",
      });
      return;
    }

    try {
      const uploadURL = await objectStorage.getObjectEntityUploadURL();
      const objectPath = objectStorage.normalizeObjectEntityPath(uploadURL);
      req.log.info(
        { userId: auth.userId, fileName: parsed.data.name, size: parsed.data.size },
        "Created image upload URL",
      );
      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, "Failed to create image upload URL");
      res.status(500).json({ error: "Failed to create image upload URL" });
    }
  },
);

router.get(
  "/storage/objects/*path",
  async (req: Request, res: Response): Promise<void> => {
    const rawPath = req.params.path;
    const objectId = Array.isArray(rawPath) ? rawPath.join("/") : rawPath;
    if (!/^uploads\/[0-9a-f-]{36}$/i.test(objectId)) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    try {
      const file = await objectStorage.getObjectEntityFile(`/objects/${objectId}`);
      const response = await objectStorage.downloadObject(file);
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      if (!response.body) {
        res.end();
        return;
      }
      Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      ).pipe(res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "Image not found" });
        return;
      }
      req.log.error({ err: error }, "Failed to serve image");
      res.status(500).json({ error: "Failed to serve image" });
    }
  },
);

export default router;
