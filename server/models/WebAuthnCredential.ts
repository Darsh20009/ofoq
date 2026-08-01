import mongoose, { Schema, Document } from "mongoose";

export interface IWebAuthnCredential extends Document {
  userId: mongoose.Types.ObjectId;
  credentialId: string;
  credentialPublicKey: Buffer;
  counter: number;
  transports?: string[];
  deviceName?: string;
  createdAt: Date;
  lastUsed?: Date;
}

const WebAuthnCredentialSchema = new Schema<IWebAuthnCredential>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  credentialId: { type: String, required: true, unique: true },
  credentialPublicKey: { type: Buffer, required: true },
  counter: { type: Number, required: true, default: 0 },
  transports: [String],
  deviceName: { type: String, default: "جهاز غير معروف" },
  lastUsed: Date,
}, { timestamps: true });

export const WebAuthnCredentialModel = mongoose.model<IWebAuthnCredential>("WebAuthnCredential", WebAuthnCredentialSchema);
