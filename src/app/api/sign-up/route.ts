import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    
    // Check if username is taken
    const existingUsername = await UserModel.findOne({ username, isVerified: true });
    if (existingUsername) {
      return NextResponse.json({
        success: false,
        message: "Username already taken",
      }, { status: 400 });
    }

    // Check if email is already registered
    const existingUserEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(Math.random() * 900000);  // Generate verification code

    if (existingUserEmail) {
      if (existingUserEmail.isVerified) {
        return NextResponse.json({
          success: false,
          message: "Email already found",
        }, { status: 500 });
      } else {
        // Update password and verification code for existing user
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserEmail.password = hashedPassword;
        existingUserEmail.verifyCode = verifyCode.toString();
        existingUserEmail.verifyExpiry = new Date(Date.now() + 36000);
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);  // Set expiry time for verification code

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send the verification email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode.toString());
    if (!emailResponse.success) {
      return NextResponse.json({
        success: false,
        message: "Email not sent",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "User registered",
    }, { status: 200 });
  } catch (error) {
    console.error("Registration error:", error);  // Log the error
    return NextResponse.json({
      success: false,
      message: "Registration failed",
    }, { status: 500 });
  }
}
