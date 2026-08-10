import mongoose, { Document, Schema } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
  active: boolean;
  lang: string;
}

const schema = new Schema<INewsletterSubscriber>({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  active:       { type: Boolean, default: true },
  lang:         { type: String, default: "ar" },
});

export const NewsletterSubscriberModel = mongoose.model<INewsletterSubscriber>(
  "NewsletterSubscriber",
  schema
);
