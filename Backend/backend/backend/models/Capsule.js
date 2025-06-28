import mongoose from "mongoose";

const capsuleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video'] },
    mediaPublicId: { type: String }, // Store Cloudinary public_id for deletion
    unlockDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    isLocked: {
        type: Boolean,
        default: true,
        get: function() {
            return new Date() < this.unlockDate;
        }
    }
});

const Capsule = mongoose.model("Capsule", capsuleSchema);
export default Capsule;