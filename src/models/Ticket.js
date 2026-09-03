import mongoose from "mongoose";
import { TICKET_STATUSES } from "../constants/statuses.js";

const ticketSchema = new mongoose.Schema(
  {
    // Referencias (ObjectId), nunca objetos embebidos
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: "confirmed",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reservationCode: {
      type: String,
      required: true,
      unique: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // createdAt / updatedAt automáticos
);

export default mongoose.model("Ticket", ticketSchema);
