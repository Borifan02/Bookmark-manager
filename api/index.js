const serverless = require('serverless-http')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { createApp } = require('../server/src/app')

// Load .env in local/dev; Vercel provides env vars in production
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmarks_db'

let isConnected = false

async function ensureConnection() {
  if (isConnected && mongoose.connection.readyState === 1) return
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    isConnected = true
    console.log('MongoDB connected (serverless)')
  } catch (err) {
    console.error('MongoDB connection error (serverless):', err)
    throw err
  }
}

const app = createApp()
const handler = serverless(app)

module.exports = async (req, res) => {
  // Ensure DB connected before handling request
  try {
    await ensureConnection()
  } catch (err) {
    res.statusCode = 500
    return res.end('Database connection error')
  }
  return handler(req, res)
}
