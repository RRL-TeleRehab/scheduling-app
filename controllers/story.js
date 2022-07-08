const Story = require("../models/story");

// @description :  Get list of all stories
// @route GET /api/story
// @access public
exports.getAllStories = (req, res, next) => {
  Story.find().exec((err, stories) => {
    if (err || !stories) {
      return res.status(400).json({ message: "No stories found" });
    }
    return res.status(200).json(stories);
  });
};

exports.getStory = (req, res, next) => {
  const storyId = req.params.storyId;
  console.log(req.params.storyId);
  Story.findById(storyId).exec((err, story) => {
    if (err || !story) {
      return res.status(400).json({ message: "No story found" });
    }
    return res.status(200).json(story);
  });
};

exports.createStory = (req, res, next) => {
  const { storyTitle, storyHeading, storyContent, storyLink, storyImageUrl } =
    req.body;
  const story = new Story({
    title: storyTitle,
    heading: storyHeading,
    content: storyContent,
    link: storyLink,
    coverPhoto: storyImageUrl,
  });
  story.save((err, data) => {
    if (err) {
      return res.status(400).json({
        message: "Unable to create story",
      });
    }
    return res.json(data);
  });
};

exports.updateStory = (req, res, next) => {
  const storyId = req.params.storyId;
  const { storyTitle, storyHeading, storyContent, storyLink, storyImageAsUrl } =
    req.body;

  Story.findByIdAndUpdate(
    { _id: storyId },
    {
      $set: {
        title: storyTitle,
        heading: storyHeading,
        content: storyContent,
        link: storyLink,
        coverPhoto: storyImageAsUrl,
      },
    },
    { new: true }
  ).exec((err, story) => {
    if (err || !story) {
      return res.status(400).json({
        error: "Story not found",
      });
    }
    return res.status(200).json(story);
  });
};

exports.deleteStory = (req, res, next) => {
  const storyId = req.params.storyId;
  Story.findByIdAndRemove(storyId).exec((err) => {
    if (err) {
      return res.status(400).json({
        message: "Unable to delete story",
      });
    }
    return res.status(200).json({
      message: "Story deleted",
    });
  });
};
