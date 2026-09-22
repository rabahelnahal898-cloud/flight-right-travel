import { Router, type IRouter } from "express";
import healthRouter from "./health";
import travelRouter from "./travel";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(travelRouter);
router.use("/payments", paymentsRouter);

export default router;
