import { Server } from 'http'
import mongoose from 'mongoose'
export const gracefulShutdown = async (
    server: Server | undefined,
    signal: string,
    exitCode = 0
) => {
    console.log(`Received ${signal}\n👿Shutting down gracefully...`)

    try {
        if (server) {
            server.close(async () => {
                console.log('HTTP server closed')

                try {
                    await mongoose.connection.close()
                    console.log(' MongoDB connection closed')
                } catch (dbError) {
                    console.error('Error closing DB:', dbError)
                }

                process.exit(exitCode)
            })

            // Force shutdown if hanging (10s timeout)
            setTimeout(() => {
                console.error(' Force shutdown due to timeout')
                process.exit(1)
            }, 10000)

        } else {
            // If server is not defined, exit immediately
            console.warn('🤪Server instance not found. Exiting immediately.')
            process.exit(exitCode)
        }
    } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
    }
}