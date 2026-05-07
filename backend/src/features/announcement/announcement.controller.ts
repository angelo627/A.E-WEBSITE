import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { announcementService } from "./announcement.service";

export const announcementController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementService.createAnnouncement(req.body);
    res.status(201).json({
      status: "success",
      data: { announcement },
    });
  }),

  getActive: asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementService.getActiveAnnouncement();
    res.status(200).json({
      status: "success",
      data: { announcement },
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const announcements = await announcementService.getAllAnnouncements();
    res.status(200).json({
      status: "success",
      data: { announcements },
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementService.updateAnnouncement(req.params.id as string, req.body);
    res.status(200).json({
      status: "success",
      data: { announcement },
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await announcementService.deleteAnnouncement(req.params.id as string);
    res.status(200).json({
      status: "success",
      data: null,
    });
  }),
};
