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
      const newUser = new authUser({ userName, email, password: hashedPassword });
      const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
      newUser.verifyToken = token;

      await newUser.save();
      res.status(201).json({ message: 'User created successfully',token });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
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
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      user.verifyToken = token;
      await user.save();
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  verifyToken: async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        const user = await authUser.findOne({ _id: decoded.userId });
        if (!user || user.verifyToken !== token) {
          return res.status(400).json({ message: 'Invalid token' });
        }
        res.status(200).json({ message: 'Token verified successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
};

export default authController;
