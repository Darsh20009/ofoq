import mongoose, { Schema, Document } from "mongoose";

// Short-lived store for WebAuthn registration/authentication challenges.
// TTL-indexed so expired challenges are cleaned up automatically by MongoDB.
export interface IWebAuthnChallenge extends Document {
  userId?: mongoose.Types.ObjectId;
  challenge: string;
  type: "register" | "authenticate";
  createdAt: Date;
  expiresAt: Date;
}

const WebAuthnChallengeSchema = new Schema<IWebAuthnChallenge>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  challenge: { type: String, required: true },
  type: { type: String, enum: ["register", "authenticate"], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const WebAuthnChallengeModel = mongoose.model<IWebAuthnChallenge>("WebAuthnChallenge", WebAuthnChallengeSchema);
