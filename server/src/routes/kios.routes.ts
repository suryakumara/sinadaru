import { Router } from "express";
import {
  getAllKios,
  getKiosById,
  createKios,
  updateKios,
  deleteKios,
} from "../controllers/kios.controller";
import { validate } from "../middlewares/validate";
import { createKiosSchema, updateKiosSchema } from "../validations/kios.validation";

const router = Router();

router.get("/", getAllKios);
router.get("/:id", getKiosById);
router.post("/", validate(createKiosSchema), createKios);
router.patch("/:id", validate(updateKiosSchema), updateKios);
router.delete("/:id", deleteKios);

export default router;
