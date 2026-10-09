import { Router, type IRouter } from "express";
import adminRouter from "./admin";
import agencyRouter from "./agency";
import catalogRouter from "./catalog";
import healthRouter from "./health";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(adminRouter);
router.use(agencyRouter);
router.use(storageRouter);

export default router;
