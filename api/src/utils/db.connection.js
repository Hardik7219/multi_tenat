import mongoose from "mongoose"

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/multi_tenat"

if (!MONGO_URL) throw new Error("MONGO_URL is not define in .env file");


// this coce is also valid for db connection but mostly it used in nextjs 
/*let cached = global.mongoose;


if(!cached)
{
    cached=global.mongoose={
        conn:null,
        promise:null
    };
}

export async function conenctDb(){
    if(cached.conn) return cached.conn;

    if(!cached.promise){
        cached.promise=mongoose.connect(MONGO_URL)
        .then((mongoose)=>{
            console.log("Mongodb connected");
            return mongoose;
            
        })
    }
    cached.conn= await cached.promise;
    return cached.conn;
}*/

export async function connectDb() {
    try {
        await mongoose.connect(MONGO_URL);

        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}