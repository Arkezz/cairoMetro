import Router from "koa-router";
import { createUser, authenticateUser } from "../controllers/auth.js";
import {
  purchaseTicket,
  viewTicketSubscriptions,
  viewUpcomingRides,
  viewCompletedRides,
  refundTicket,
  checkPricing,
} from "../controllers/ticket.js";
import {
  uploadSeniorRequest,
  approveSeniorRequest,
} from "../controllers/senior.js";
import {
  createStation,
  updateStation,
  deleteStation,
} from "../controllers/station.js";
import {
  createRoute,
  updateRoute,
  deleteRoute,
  updatePricingSchedule,
} from "../controllers/route.js";
import { approveRefundRequest } from "../controllers/refund.js";

const router = new Router();

// Authentication Routes
router.post("/register", createUser);
router.post("/login", authenticateUser);

// Ticket Routes
router.post("/purchase-ticket", purchaseTicket);
router.get("/ticket-subscriptions", viewTicketSubscriptions);
router.get("/upcoming-rides", viewUpcomingRides);
router.get("/completed-rides", viewCompletedRides);
router.post("/refund-ticket", refundTicket);
router.get("/check-pricing", checkPricing);

// Senior Request Routes
router.post("/upload-senior-request", uploadSeniorRequest);
router.post("/approve-senior-request", approveSeniorRequest);

// Station Routes
router.post("/create-station", createStation);
router.put("/update-station/:id", updateStation);
router.delete("/delete-station/:id", deleteStation);

// Route Routes
router.post("/create-route", createRoute);
router.put("/update-route/:id", updateRoute);
router.delete("/delete-route/:id", deleteRoute);
router.put("/update-pricing-schedule", updatePricingSchedule);

// Refund Request Route
router.post("/approve-refund-request", approveRefundRequest);

export default router;
