import Router from "koa-router";
import { checkAdminRole } from "../controllers/auth.js";
import { getUserInfo } from "../controllers/user.js";
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
  viewAllStations,
  createStation,
  updateStation,
  deleteStation,
} from "../controllers/station.js";
import {
  viewAllRoutes,
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

//User Routes
router.get("/user-info", getUserInfo);

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
router.post("/approve-senior-request", checkAdminRole, approveSeniorRequest);

// Station Routes
router.get("/view-all-stations", viewAllStations);
router.post("/create-station", checkAdminRole, createStation);
router.put("/update-station/:id", checkAdminRole, updateStation);
router.delete("/delete-station/:id", checkAdminRole, deleteStation);

// Route Routes
router.get("/view-all-routes", viewAllRoutes);
router.post("/create-route", checkAdminRole, createRoute);
router.put("/update-route/:id", checkAdminRole, updateRoute);
router.delete("/delete-route/:id", checkAdminRole, deleteRoute);
router.put("/update-pricing-schedule", checkAdminRole, updatePricingSchedule);

// Refund Request Route
router.get("/view-refund-requests", viewRefundRequests);
router.post("/upload-refund-request", uploadRefundRequest);
router.post("/approve-refund-request", checkAdminRole, approveRefundRequest);

export default router;
