import express from 'express'
import cors from 'cors'
import { globalErrorHandler, notFoundHandler } from './app/middleware/globalErrorHandler/error.handler.js'
import rootRoute from './app/utils/server_check/initial.route.js'
import router from './app/routes/index.js'
import cookieParser from 'cookie-parser'

// Create an instance of the Express application
const app = express()

// Middleware 
app.use(express.json()) // Middleware to parse JSON request bodies
app.use(
	cors({
		origin: true,
		credentials: true,
	}),
) // Allow browser clients from any origin while preserving credentialed requests.
app.use(cookieParser())

//application all routes
app.use('/api/v1', router)


// Root route-test
app.get('/', rootRoute)

// 404 handler for undefined routes
app.use(notFoundHandler)
//global error handler
app.use(globalErrorHandler)


export default app
