import mongoose from "mongoose";
type ConnectionObj = {
  isConnected?: number;
};

const connection: ConnectionObj = {};
export async function dbConnect(): Promise<void> {
  console.log("dbConnect called");
  if (connection.isConnected) {
    console.log("DB already Connected");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI! || '');
    // console.log(db)
    connection.isConnected = db.connections[0].readyState;
    console.log("DB Connected Sucessfully");
  } catch (error: any) {
    console.log("DB Not Connected");
    console.log(error.message);
    process.exit();
  }
}
