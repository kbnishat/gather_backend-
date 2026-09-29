import type { Request, Response } from 'express'
import app from '../src/app.js'
import { connectToDatabase } from '../src/app/db/db.js'

export default async function handler(req: Request, res: Response) {
  try {
    await connectToDatabase()
    return app(req, res)
  } catch (error) {
    console.error('Serverless invocation failed:', error)
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
