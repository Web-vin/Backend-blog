const express = require("express")
const User  = require("../Schema/User")
const authMiddleware = require("../middleware/authMiddleware")
const router = express.Router();


// Get the logged-in user's details (Protected Route)
router.get("/me", authMiddleware, async (req, res) => {
   try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.put("/edit", authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body; // Get updated details from request body

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true, select: "-password" } // Return updated user, excluding password
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;