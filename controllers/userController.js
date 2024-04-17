// controller for user

const User = require('../models/Users');
const log = require('../config/logger');
const jwt = require('jsonwebtoken');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// login controller
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // console.log(`username: ${username}, password: ${password}, env: ${process.env.USER}, ${process.env.PASSWORD}`)

        // check if it matches the username and password in the env
        if (username === process.env.USER && password === process.env.PASSWORD) {
            const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ success: true, message: 'Login successful', token: token });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    }
    catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// register controller
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, dob, gender, nationality, phone, role } = req.body;

        // check if all fields are provided
        if (!firstName || !lastName || !email || !dob || !gender || !nationality || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // check if email is valid
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        // check if user already exists
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // create new user
        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dob: dob,
            gender: gender,
            nationality: nationality,
            phone: phone,
            role: role
        });

        // save user
        await newUser.save();
        return res.status(201).json({ success: true, message: 'User created successfully' });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// update user controller
exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, dob, gender, nationality, phone, role } = req.body;

        // check if any field is provided
        if (!firstName && !lastName && !email && !dob && !gender && !nationality && !phone && !role) {
            return res.status(400).json({ success: false, message: 'At least one field is required' });
        }

        // check if email is valid
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        // check if user exists
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // update user
        await User.updateOne({ email: email }, { $set: req.body });
        return res.status(200).json({ success: true, message: 'User updated successfully' });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// delete user controller
exports.deleteUser = async (req, res) => {
    try {
        const { email } = req.body;

        // check if user exists
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // delete user: change active status to false
        await User.updateOne({ email: email }, { $set: { active: false } });
        return res.status(200).json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

// get all users controller
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, users: users });
    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// get user controller
exports.getUser = async (req, res) => {
    try {
        const { email } = req.body;

        // check if user exists
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        return res.status(200).json({ success: true, user: user });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// get user by id controller
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // check if user exists
        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        return res.status(200).json({ success: true, user: user });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// controllers for graph data
