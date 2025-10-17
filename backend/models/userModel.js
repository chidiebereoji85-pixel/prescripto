import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    image: { type: String, default: "https://yourapp.com/images/default-user.png"},   
    address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' }},
    gender: {type: String, default: "Not Selected"},
    dob: {type: Date, default: null},
    phone: {type: String, default: '00000000000'}

})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel;