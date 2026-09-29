// initial route
import { Router } from 'express'
import { Request, Response } from 'express'

// Root route-test
const rootRoute = (req: Request, res: Response) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Welcome to greater System API'
        })
    } catch (error) {
        console.error('Error in root route:', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export default rootRoute
