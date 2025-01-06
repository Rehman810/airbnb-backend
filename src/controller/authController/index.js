import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authUser from '../../model/hostModel/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  signUp: async (req, res) => {
    try {
      const { userName, email, password } = req.body;
      const existingUser = await authUser.findOne({ email });
      if (existingUser) {
        return res.status(403).json({ message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new authUser({ userName, email, password: hashedPassword });
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '10h' });
      user.verifyToken = token;

      await user.save();
      res.status(201).json({ message: 'User created successfully',token,user });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    };
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authUser.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '10h' });
      user.verifyToken = token;
      await user.save();
      res.status(200).json({ token ,user});
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { hostId } = req.params;
      const dataUpdate = { ...req.body };
  
      if (req.file) {
        dataUpdate.photoProfile = req.file.path; 
      }
  
      const host = await authUser.findById(hostId);
      if (!host) {
        return res.status(404).json({ message: "Host Not Found" });
      }
  
      const updatedData = await authUser.findByIdAndUpdate(hostId, dataUpdate, { new: true });
      return res.status(200).send({ message: "Success", updatedData });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  
  
  verifyToken: async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        console.log("User ",decoded)
        if (err) {
          return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        const user = await authUser.findOne({ _id: decoded.userId });
        console.log("User",user)
        if (!user || user.verifyToken !== token) {
          return res.status(400).json({ message: 'Invalid token' });
        }
        res.status(200).json({ message: 'Token verified successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1]; 
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        const { userId } = decoded;
        const user = await authUser.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
          if (!user.verifyToken || user.verifyToken !== token) {
          return res.status(400).json({ message: 'Already logged out or token is invalid' });
        }
  
        user.verifyToken = null; 
        await user.save();
  
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
};

export default authController;
