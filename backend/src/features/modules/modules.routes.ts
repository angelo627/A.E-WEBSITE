import { Router } from "express";

import { modulesController } from "./modules.controller";

const publicModulesRouter = Router();
publicModulesRouter.get("/", modulesController.listPublicModules);
publicModulesRouter.get("/:slug", modulesController.getPublicModule);

const learnerModulesRouter = Router();
learnerModulesRouter.get("/", modulesController.listMyModules);
learnerModulesRouter.get("/:slug", modulesController.getMyModuleDetail);
learnerModulesRouter.patch("/:moduleId/progress", modulesController.updateProgress);

import { uploadModuleVideo } from "../../middlewares/upload.middleware";

const adminModulesRouter = Router();
adminModulesRouter.get("/", modulesController.listAdminModules);
adminModulesRouter.get("/:moduleId", modulesController.getAdminModule);
adminModulesRouter.post("/", uploadModuleVideo.single("video"), modulesController.createModule);
adminModulesRouter.patch("/:moduleId", uploadModuleVideo.single("video"), modulesController.updateModule);
adminModulesRouter.delete("/:moduleId", modulesController.deleteModule);
adminModulesRouter.post(
  "/upload-video",
  uploadModuleVideo.single("video"),
  modulesController.uploadVideo
);

export { adminModulesRouter, learnerModulesRouter, publicModulesRouter };
