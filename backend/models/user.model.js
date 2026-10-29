import mongoose from "mongoose"
import bcrypt from "bcryptjs"//for password encryption 
import jwt from "jsonwebtoken"//for json web token means authentication 

// Wishlist item subdocument
const wishlistItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  image: {
    type: String,
    default: "/image/c1.png",
  },
  description: {
    type: String,
    default: "",
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
});

//main user schema 
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true,
        unique:true,
        lowercase:true,
        index:true, //database search faster 
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,"Password must be at least 8 characters long"],
        
    },
    wishlist:[wishlistItemSchema],
    
    

},{timestamps:true})

// Pre-save hook: Hash password before saving to MongoDB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);//in detail: it is for generating random salt and then hashing the password using that salt 
  next();
});

// Instance method(khud se bnaye hue method): verify password
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method: generate signed JWT
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );
};

// Instance method: Generate Long-lived Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    }
  );
};

export const User = mongoose.model("User", userSchema);