import 'reflect-metadata';
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors"
import createConnection from "./database";
import { router } from "./routes";
import { AppError } from './errors/AppError';


createConnection();
const app = express();

app.use(express.json());
app.use(router);

app.use((err: Error, request: Request, response: Response, _next: NextFunction) => {
    // Caso o erro seja do tipo AppError
    if (err instanceof AppError) {
        return response.status(err.statusCode).json({
            message: err.message
        })
    }

    // Caso seja um erro de servidor ou erro não tratado
    return response.status(500).json({
        status: "Error",
        message: `Internal server error ${err.message}`
    })

})

export { app };