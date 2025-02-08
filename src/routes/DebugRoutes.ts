import express from "express";

const router = express.Router();

/**
 * ✅ Rute pentru debugging și testare erori.
 */
router.get("/test-error", (req, res) => {
  throw new Error("🔴 Eroare test Sentry");
});

router.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

export default router;
