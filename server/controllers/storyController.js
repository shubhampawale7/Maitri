import Story from "../models/Story.js";
import cloudinary from "../config/cloudinary.js";

export const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please provide an image or video." });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    const newStory = await Story.create({
      author: req.user._id,
      mediaUrl: result.secure_url,
      // Updated to correctly identify video type
      mediaType: result.resource_type === "video" ? "video" : "image",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    const populatedStory = await Story.findById(newStory._id).populate(
      "author",
      "username profilePicture"
    );

    res.status(201).json(populatedStory);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      author: { $ne: req.user._id },
      expiresAt: { $gt: new Date() },
    })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    const groupedStories = stories.reduce((acc, story) => {
      const authorId = story.author._id.toString();
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: [],
        };
      }
      acc[authorId].stories.push(story);
      return acc;
    }, {});

    res.status(200).json(Object.values(groupedStories));
  } catch (error) {
    console.error("Error getting stories:", error);
    res.status(500).json({ message: "Server error" });
  }
};
