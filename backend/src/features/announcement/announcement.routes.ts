import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { UserRole } from "../../shared/constants/auth";
import { announcementController } from "./announcement.controller";

const router = Router();

// Publicly accessible for authenticated users to see the banner
router.get("/active", authenticate, announcementController.getActive);

// Admin-only management routes
router.get("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), announcementController.getAll);
router.post("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), announcementController.create);
router.patch("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), announcementController.update);
router.delete("/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), announcementController.delete);

export default router;
