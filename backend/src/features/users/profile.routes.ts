import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate } from "../../middlewares/auth";

const profileRouter = Router();

// Public profile
profileRouter.get("/:username", usersController.getPublicProfile);

// Authenticated profile management
profileRouter.patch("/", authenticate, usersController.updateMyProfile);

export { profileRouter };
