import express from "express";
import Stripe from "stripe";
import appointmentModel from "../models/appointmentModel.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// ✅ Create Checkout Session
router.post("/create-checkout-session", async (req, res) => {
    try {
      const { appointmentId } = req.body;
      const appointment = await appointmentModel
        .findById(appointmentId)
        .populate("docId");
  
      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }
  
      // ✅ Use doctor's fee or fallback (Stripe needs >= ₦50 or ~$0.50)
      const fee = Math.max(appointment.docId.fees, 1000);
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd", // ✅ STRIPE doesn't fully support NGN yet for Checkout
              product_data: {
                name: `Appointment with Dr. ${appointment.docId.name}`,
              },
              unit_amount: Math.round((fee / 1600) * 100), // 👈 convert ₦ to cents roughly ($1 ≈ ₦1600)
            },
            quantity: 1,
          },
        ],
        // ✅ Always include HTTPS in URLs
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/my-appointments`,

        metadata: {
          appointmentId: appointment._id.toString(),
        },
      });
  
      res.json({ success: true, url: session.url });
    } catch (error) {
      console.error("Stripe session error:", error);
      res.status(500).json({ success: false, message: "Payment session failed" });
    }
  });
    

// ✅ Stripe Webhook (auto update after success)
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;
  
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  
      // Handle successful checkout
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const appointmentId = session.metadata?.appointmentId;
  
        if (appointmentId) {
          await appointmentModel.findByIdAndUpdate(appointmentId, {
            payment: true,
            paymentReference: session.payment_intent || session.id,
            paymentDate: new Date(),
          });
  
          console.log(`✅ Appointment ${appointmentId} marked as paid.`);
        } else {
          console.warn("⚠️ No appointmentId found in metadata.");
        }
      }
  
      res.status(200).json({ received: true });
    }
  );
  
  // ✅ Verify Payment after redirect
router.get("/verify-payment", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const appointmentId = session.metadata?.appointmentId;

      if (appointmentId) {
        await appointmentModel.findByIdAndUpdate(appointmentId, {
          payment: true,
          paymentReference: session.payment_intent || session.id,
          paymentDate: new Date(),
        });
      }

      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ success: false, message: "Server error verifying payment" });
  }
});


export default router;
