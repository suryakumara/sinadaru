import { Router } from "express";
import {
  getAllPasar,
  getPasarById,
  createPasar,
  updatePasar,
  deletePasar,
} from "../controllers/pasar.controller";
import { validate } from "../middlewares/validate";
import { createPasarSchema, updatePasarSchema } from "../validations/pasar.validation";

const router = Router();

router.get("/", getAllPasar);
router.get("/:id", getPasarById);
router.post("/", validate(createPasarSchema), createPasar);
router.patch("/:id", validate(updatePasarSchema), updatePasar);
router.delete("/:id", deletePasar);

export default router;
