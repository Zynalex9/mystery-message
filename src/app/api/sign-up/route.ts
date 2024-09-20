import { dbConnect } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUsername) {
      return NextResponse.json(
        {
          message: "Username already taken",
          success: false,
        },
        {
          status: 400,
        }
      );
    }
    const existingUserEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(Math.random() * 900000);
    if (existingUserEmail) {
      if (existingUserEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already found",
          },
          { status: 500 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserEmail.password = hashedPassword;
        existingUserEmail.verifyCode = verifyCode.toString();
        existingUserEmail.verifyExpiry = new Date(Date.now() + 36000);
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
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
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode.toString()
    );
    if (!emailResponse) {
      return Response.json(
        {
          success: false,
          message: "Email not sent",
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: error,
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
