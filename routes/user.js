// route file for user

const router = require('express').Router();

// controllers
const { login, register, updateUser, deleteUser, getAllUsers, getUser } = require('../controllers/userController');

// middleware
const checkAuth = require('../middleware');

// routes
router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the Intergral Test' });
});
router.post('/login', login);
router.post('/register', checkAuth, register);
router.post('/update', checkAuth, updateUser);
router.post('/delete', checkAuth, deleteUser);
router.get('/all-users', checkAuth, getAllUsers);
router.get('/get-user', checkAuth, getUser);



// 404 route
router.all('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = router;