import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';



const createToken = (id) => {
    return  jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({email});


        if (!user) {
            return res.json({success: false, message: "User doesn't exists"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id);
            res.json({success: true, token});
       
        }else{
            res.json({success: false, message: "Invalid Credentials"});
        }
        
    } catch (error) {

        console.log(error);
        res.json({success: false, message: error.message});
        
    }



}




// Route for user registration
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // Checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({success: false, message: "User already exists"});  
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({success: false, message: "Please  enter a vaild email"});              
        }
        if (password.length < 8) {
            return res.json({success: false, message: "Please  enter a strong password"});              
        }

        // hashing user Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({success: true, token})
        
    } catch (error) {
           console.log(error);
           res.json({success: false, message: error.message});
                
    }

}
// Route for admin login
const adminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success: true, token});
        }else {
            res.json({success: false, message: "Invalid Credentials"});
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
        
    }



}

// Find user by email (for cart functionality)
const findUserByEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({success: false, message: "Email is required"});
        }

        // Find user by email but don't return sensitive data
        const user = await userModel.findOne({ email }).select('-password');

        if (!user) {
            return res.json({success: false, message: "User not found"});
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
};
// Get current user (for token verification)
const getCurrentUser = async (req, res) => {
    try {
        // The auth middleware already verified the token and attached the user
        // We just need to return a success response
        res.json({
            success: true,
            message: "Token is valid",
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
};

export { loginUser, registerUser, adminLogin, findUserByEmail, getCurrentUser };