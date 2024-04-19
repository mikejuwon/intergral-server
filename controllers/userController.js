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
            const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '7h' });
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
        const { id } = req.params;

        // check if any field is provided
        if (!firstName && !lastName && !email && !dob && !gender && !nationality && !phone && !role) {
            return res.status(400).json({ success: false, message: 'At least one field is required' });
        }

        // check if email is valid
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        // check if user exists
        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // update user
        await User.updateOne({ _id: id }, { $set: req.body });
        return res.status(200).json({ success: true, message: 'User updated successfully' });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// delete user controller
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // check if user exists
        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // delete user: change active status to false
        await User.updateOne({ _id: id }, { $set: { active: false } });
        return res.status(200).json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

// get all users controller
exports.getAllUsers = async (req, res) => {
    try {
        // get all active users
        const users = await User.find({ active: true });
        return res.status(200).json({ success: true, users: users });
    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// get user controller
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;

        // check if user exists
        const user = await User.findOne({ _id: id, active: true });

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
// exports.getGenderData = async (req, res) => {
//     try {
//         const genderGroups = [
//             { label: 'male' },
//             { label: 'female' },
//             { label: 'others' }
//         ];

//         // get the total number first
//         const total = await User.countDocuments({ active: true });

//         // get all users from the database
//         const users = await User.find({ active: true });

//         // get the count for each
//         let genderData = genderGroups.map(group => ({
//             label: group.label,
//             count: 0
//         }));

//         // calculate the count
//         users.forEach(user => {


//     } catch (error) {
//         log.error(`Error: ${error.message}`);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// }

exports.getGenderData = async (req, res) => {
    try {
        // get the total number first
        const total = await User.countDocuments({ active: true });

        // Query the database to get gender distribution data for active users
        const genderData = await User.aggregate([
            {
                $match: { active: true }
            },
            {
                $group: {
                    _id: '$gender',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Prepare response data
        let maleCount = 0;
        let femaleCount = 0;
        let othersCount = 0;

        genderData.forEach(item => {
            if (item._id === 'male') {
                maleCount = item.count;
            } else if (item._id === 'female') {
                femaleCount = item.count;
            } else {
                othersCount += item.count;
            }
        });

        console.log(maleCount, femaleCount, othersCount)

        return res.status(200).json({
            success: true,
            data: {
                total: total,
                male: maleCount,
                female: femaleCount,
                others: othersCount
            }
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getAgeDistribution = async (req, res) => {
    try {
        // Define age groups
        const ageGroups = [
            { label: '0-18', minAge: 0, maxAge: 18, title: 'Children and Teenagers' },
            { label: '19-35', minAge: 19, maxAge: 35, title: 'Young Adults' },
            { label: '36-50', minAge: 36, maxAge: 50, title: 'Middle-Aged Adults' },
            { label: '51-65', minAge: 51, maxAge: 65, title: 'Older Adults' },
            { label: '65+', minAge: 66, maxAge: Infinity, title: 'Seniors' }
        ];

        // Initialize age distribution data with 0 counts for all age groups
        let ageDistribution = ageGroups.map(group => ({
            ageRange: group.label,
            title: group.title,
            count: 0
        }));

        // Fetch all users from the database that have date of birth and active status
        const users = await User.find({ dob: { $ne: null }, active: true });

        console.log(users.length)

        // Calculate age and update count for each age group
        users.forEach(user => {
            const age = calculateAge(user.dob);
            const groupIndex = ageGroups.findIndex(group => age >= group.minAge && age <= group.maxAge);
            if (groupIndex !== -1) {
                ageDistribution[groupIndex].count++;
            }
        });

        // Send the age distribution data as a response
        return res.status(200).json({ success: true, data: ageDistribution });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Function to calculate age based on date of birth
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

exports.getRoleData = async (req, res) => {
    try {
        // get the total number first
        const total = await User.countDocuments();

        // get the number of "admin" and "subscriber" users
        const adminCount = await User.countDocuments({ role: "admin" });
        const subscriberCount = await User.countDocuments({ role: "subscriber" });

        return res.status(200).json({ success: true, data: { total: total, adminUsers: adminCount, subscriberUsers: subscriberCount } });

    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
