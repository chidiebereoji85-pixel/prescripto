import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import stripeRoutes from "./routes/stripeRoutes.js"; 
import path from "path";
import { fileURLToPath } from "url";


// app config
const app = express();
const port  = process.env.PORT || 4000
connectDB()
connectCloudinary()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));


// middlewares
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/api/stripe", stripeRoutes);


// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res)=>{
    res.send('API WORKING')
});

app.listen(port, ()=> console.log("Server Started", port))