const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'cartify-development-secret';
const JWT_EXPIRES_IN = '7d';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at
  };
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

async function signup(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (userModel.findByEmail(email)) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = userModel.create({ name, email, phone, passwordHash });
    const token = signToken(user);
    res.status(201).json({ success: true, message: 'Account created successfully', token, user });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = userModel.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ success: true, message: 'Login successful', token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  const user = userModel.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
}

module.exports = { signup, login, me };
