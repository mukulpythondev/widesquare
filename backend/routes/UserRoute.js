import express from 'express';
import { login, register, forgotpassword,adminlogin,resetpassword,getname, requestAgent, requestSeller } from '../controller/Usercontroller.js';
import {protect} from '../middleware/authmiddleware.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', protect, getname);
userrouter.post('/request-agent', protect, requestAgent);
userrouter.post('/request-seller', protect, requestSeller);


export default userrouter;