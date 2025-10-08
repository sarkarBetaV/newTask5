import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { sendVerificationEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, designation } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = jwt.sign(
      { email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      designation,
      status: 'unverified',
      emailVerificationToken
    });

    sendVerificationEmail(user);

    res.status(201).json({ 
      message: 'Registration successful. Please check your email for verification.',
      userId: user.id 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Account is blocked' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.update({ lastLoginTime: new Date() });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        designation: user.designation
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'emailVerificationToken'] },
      order: [['lastLoginTime', 'DESC']]
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ 
      where: { email: decoded.email, status: 'unverified' } 
    });
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification-failed`);
    }

    await user.update({ 
      status: 'active',
      emailVerificationToken: null 
    });

    res.redirect(`${process.env.FRONTEND_URL}/verification-success`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/verification-failed`);
  }
};

export const bulkAction = async (req, res) => {
  try {
    const { userIds, action } = req.body;
    
    switch (action) {
      case 'block':
        await User.update({ status: 'blocked' }, { 
          where: { id: userIds } 
        });
        break;
      case 'unblock':
        await User.update({ status: 'active' }, { 
          where: { id: userIds } 
        });
        break;
      case 'delete':
        await User.destroy({ where: { id: userIds } });
        break;
      case 'deleteUnverified':
        await User.destroy({ 
          where: { 
            status: 'unverified',
            id: userIds 
          } 
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `${action} action completed successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Bulk action failed' });
  }
};