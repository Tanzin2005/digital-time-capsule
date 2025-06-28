import express from "express";
import Capsule from "../models/Capsule.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Get all capsules
router.get("/", authMiddleware, async (req, res) => {
    try {
        const capsules = await Capsule.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(capsules);
    } catch (error) {
        res.status(500).json({ message: "Error fetching capsules" });
    }
});

// Create a new capsule
router.post("/", authMiddleware, upload.single('media'), async (req, res) => {
    try {
        const { title, description, unlockDate } = req.body;
        
        const capsuleData = {
            userId: req.user.id,
            title,
            description,
            unlockDate: new Date(unlockDate)
        };

        if (req.file) {
            capsuleData.mediaUrl = req.file.path;
            capsuleData.mediaPublicId = req.file.filename;
            capsuleData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
        }

        const newCapsule = new Capsule(capsuleData);
        const savedCapsule = await newCapsule.save();
        res.status(201).json(savedCapsule);
    } catch (error) {
        res.status(500).json({ message: "Error creating capsule" });
    }
});

// Delete a capsule
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!capsule) {
            return res.status(404).json({ message: "Capsule not found" });
        }

        // Delete media from Cloudinary if exists
        if (capsule.mediaPublicId) {
            await cloudinary.uploader.destroy(capsule.mediaPublicId);
        }

        await capsule.deleteOne();
        res.json({ message: "Capsule deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting capsule" });
    }
});

export default router;