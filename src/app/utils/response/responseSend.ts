import { Response } from "express";

// Define a generic type for the response data
type responseT<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
};
// Utility function to send a standardized response
const sendResponse = <T>(res: Response, data: responseT<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
  });
};

export default sendResponse;
