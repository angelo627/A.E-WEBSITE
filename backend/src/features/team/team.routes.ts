import { Router } from "express";

import { teamController } from "./team.controller";

import { uploadTeamPhoto } from "../../middlewares/upload.middleware";

const publicTeamRouter = Router();
publicTeamRouter.get("/", teamController.listPublic);

const adminTeamRouter = Router();
adminTeamRouter.get("/", teamController.listAdmin);
adminTeamRouter.get("/:teamMemberId", teamController.getOne);
adminTeamRouter.post("/", uploadTeamPhoto.single("image"), teamController.create);
adminTeamRouter.patch("/:teamMemberId", uploadTeamPhoto.single("image"), teamController.update);
adminTeamRouter.delete("/:teamMemberId", teamController.delete);

export { adminTeamRouter, publicTeamRouter };
