import { dbConnect } from "@/lib/dbConnect";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import UserModel from "@/models/User";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"), //Example out: localhost:3000/api/cuu?username=zain?phone=andriod
      // we will get only username from username
    };
    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParams);
    console.log(result);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "invalid query parameters",
        },
        {
          status: 400,
        }
      );
    }
    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "User name is already taken",
        },
        {
          status: 400,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username available",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    );
  }
}
