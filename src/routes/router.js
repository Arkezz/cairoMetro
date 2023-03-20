import Router from "koa-router";
import {
  createUser,
  authenticateUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.js";
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
  viewSeniorRequests,
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
import {
  uploadRefundRequest,
  approveRefundRequest,
  viewRefundRequests,
} from "../controllers/refund.js";

const router = new Router();

// Authentication Routes
router.post("/register", createUser);
router.post("/login", authenticateUser);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Ticket Routes
router.post("/purchase-ticket", purchaseTicket);
router.get("/ticket-subscriptions", viewTicketSubscriptions);
router.get("/upcoming-rides", viewUpcomingRides);
router.get("/completed-rides", viewCompletedRides);
router.post("/refund-ticket", refundTicket);
router.get("/check-pricing", checkPricing);

// Senior Request Routes
router.get("/view-senior-requests", viewSeniorRequests);
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
router.get("/view-refund-requests", viewRefundRequests);
router.post("/upload-refund-request", uploadRefundRequest);
router.post("/approve-refund-request", approveRefundRequest);

export default router;
