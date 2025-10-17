import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setMessage("❌ Invalid payment session.");
        setLoading(false);
        return;
      }

      try {
        // 👇 Hit backend to confirm session status from Stripe
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stripe/verify-payment?session_id=${sessionId}`);
        if (res.data.success) {
          setMessage("✅ Payment confirmed! Redirecting...");
          // Wait a bit then redirect
          setTimeout(() => navigate("/my-appointments"), 2500);
        } else {
          setMessage("⚠️ Payment not verified.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("❌ Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{message}</h2>
      {loading && <p>Checking Stripe confirmation...</p>}
    </div>
  );
};

export default PaymentSuccess;
