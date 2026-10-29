import { Router } from "express";
import {submitContact} from "../controllers/contact.controller.js";

const router = Router();

//Public routes
router.route("/").post(submitContact);

export default router;