// route file for user

const router = require("express").Router();

// controllers
const {
  login,
  register,
  updateUser,
  deleteUser,
  getAllUsers,
  getUser,
  getUserById,
  getGenderData,
  getAgeDistribution,
  getRoleData,
} = require("../controllers/userController");

// middleware
const checkAuth = require("../middleware");

// routes
router.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome to the Intergral Test" });
});
router.post("/login", login);
router.post("/register", checkAuth, register);
router.post("/update-user/:id", checkAuth, updateUser);
router.post("/delete/:id", checkAuth, deleteUser);
router.get("/all-users", checkAuth, getAllUsers);
router.get("/get-user/:id", checkAuth, getUser);
router.get("/gender-data", checkAuth, getGenderData);
router.get("/age-distribution", checkAuth, getAgeDistribution);
router.get("/role-data", checkAuth, getRoleData);

// 404 route
router.all("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = router;
