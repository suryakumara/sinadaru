import { Router } from "express";
import pasarRoutes from "./pasar.routes";
import kiosRoutes from "./kios.routes";

const router = Router();

router.use("/pasars", pasarRoutes);
router.use("/kios", kiosRoutes);

export default router;
