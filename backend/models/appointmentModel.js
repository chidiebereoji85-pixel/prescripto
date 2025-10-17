import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    docId: { type: Schema.Types.ObjectId, ref: "doctor", required: true },
    slotDate: { type: Date, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    amount: { type: Number, required: true },

    // Appointment states
    cancelled: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },

    // ✅ Payment-related fields
    payment: { type: Boolean, default: false }, // Whether it's paid
    paymentReference: { type: String }, // Paystack reference
    paymentDate: { type: Date }, // When it was paid
  },
  { timestamps: true }
);

// // Prevent duplicate booking for same user-doctor-slot
// appointmentSchema.index(
//   { userId: 1, docId: 1, slotDate: 1, slotTime: 1 },
//   { unique: true }
// );

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
