# Project Structure

```
└── api
    └── package.json
```

# File Contents

## api/package.json

```json
{
  "name": "api",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.6",
    "dotenv": "^18.0.5",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.10.4",
    "next-auth": "^5.0.0-beta.32"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}

```

# Project Structure

```
└── api
    └── src
        └── server.js
```

# File Contents

## api/src/server.js

```javascript
import { connectDb }  from "./utils/db.connection.js";
import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import tenateRoutes from "./routes/tenancy.route.js"
import cors from "cors"

dotenv.config();


const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}))



app.get("/",(req,res)=>{
    res.send("running")
})

await connectDb();


app.use('/api/auth',authRoute)
app.use("/api/tickets", ticketRoutes);
app.use("/api/tenants", tenateRoutes);

app.listen(process.env.PORT,()=>{
    console.log("runnning")
})
```
# Project Structure

```
└── api
    └── src
        └── models
            └── user.model.js
```

# File Contents

## api/src/models/user.model.js

```javascript
import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    username: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    authId: String,
    password: String,
    avatar: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['owner', 'organization', 'customer'],
        default: 'customer'
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenancy",
        required: false,
        index: true,
    },
}, {
    timestamps: true
})

export const User = mongoose.model('User', userSchema);
```


# Project Structure

```
└── api
    └── src
        └── models
            └── tenancy.model.js
```

# File Contents

## api/src/models/tenancy.model.js

```javascript
import mongoose from "mongoose";

const tenancySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        status: {
            type: String,
            enum: ["active", "suspended", "deleted"],
            default: "active",
        },

        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free",
        },
    },
    {
        timestamps: true,
    }
);

export const Tenancy = mongoose.model("Tenancy", tenancySchema);
```
# Project Structure

```
└── api
    └── src
        └── models
            └── ticket.model.js
```

# File Contents

## api/src/models/ticket.model.js

```javascript
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            required: true,
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "open",
                "in_progress",
                "resolved",
                "closed"
            ],
            default: "open",
            index: true,
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "urgent"
            ],
            default: "medium",
        },

        category: {
            type: String,
            trim: true,
            default: null,
        },

        tags: {
            type: [String],
            default: [],
        },

        resolvedAt: {
            type: Date,
            default: null,
        },

        closedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
```
# Project Structure

```
└── api
    └── src
        └── controllers
            └── auth.controller.js
```

# File Contents

## api/src/controllers/auth.controller.js

```javascript
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwtTokenGenerator.js";

export const createUser = async (req, res) => {
    try {
        console.log("hello");
        
        const { email, username, password, role, tenantId } = req.body;
        if (!email || !username || !password) return res.status(400).json({ message: "fill all the fields" })
        const isExist = await User.findOne({ email });
        if (isExist) {
            return res.status(409).json({ message: "user already exist" });
        }
        const hashPass = await bcrypt.hash(password, 12)
        const user = await User.create({
            username, 
            email, 
            password: hashPass,
            role: role || 'customer',
            tenantId: tenantId || null
        })
        return res.status(201).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to create user" })
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: "fill all the fields" })

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId?.toString() || null,
            accessToken,
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function deleteUser() {

}


export async function fetchProfile() {

}
```
# Project Structure

```
└── api
    └── src
        └── controllers
            └── tenancy.controller.js
```

# File Contents

## api/src/controllers/tenancy.controller.js

```javascript
import { Tenancy } from "../models/tenancy.model.js";
import { User } from "../models/user.model.js";


// Create a new organization / tenant
export async function createTenancy(req, res) {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                message: "Organization name and slug are required",
            });
        }

        if (req.user.tenantId) {
            return res.status(400).json({
                message: "User already belongs to an organization",
            });
        }

        const existingTenancy = await Tenancy.findOne({ slug });

        if (existingTenancy) {
            return res.status(409).json({
                message: "Organization already exists",
            });
        }

        const tenancy = await Tenancy.create({
            name,
            slug,
        });

        await User.findByIdAndUpdate(
            req.user.id,
            {
                tenantId: tenancy._id,
                role: "owner",
            },
            {
                new: true,
            }
        );

        return res.status(201).json({
            message: "Organization created successfully",
            tenancy,
        });

    } catch (error) {
        console.error("CREATE TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to create organization",
        });
    }
}


// Fetch current user's organization
export async function fetchTenancy(req, res) {
    try {
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const tenancy = await Tenancy.findById(tenantId);

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        return res.status(200).json({
            tenancy,
        });

    } catch (error) {
        console.error("FETCH TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch organization",
        });
    }
}


// Update organization
export async function updateTenancy(req, res) {
    try {
        const tenantId = req.user.tenantId;

        if (req.user.role !== "owner" && req.user.role !== "organization") {
            return res.status(403).json({
                message: "Unauthorized to update organization",
            });
        }

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const { name, slug, plan, status } = req.body;

        const tenancy = await Tenancy.findByIdAndUpdate(
            tenantId,
            {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(plan !== undefined && { plan }),
                ...(status !== undefined && { status }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        return res.status(200).json({
            message: "Organization updated successfully",
            tenancy,
        });

    } catch (error) {
        console.error("UPDATE TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to update organization",
        });
    }
}


// Delete organization
export async function deleteTenancy(req, res) {
    try {
        const tenantId = req.user.tenantId;

        if (req.user.role !== "owner" && req.user.role !== "organization") {
            return res.status(403).json({
                message: "Unauthorized to delete organization",
            });
        }

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const tenancy = await Tenancy.findByIdAndDelete(tenantId);

        if (!tenancy) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }

        await User.updateMany(
            { tenantId },
            {
                $unset: {
                    tenantId: 1,
                },
                $set: {
                    role: "customer",
                },
            }
        );

        return res.status(200).json({
            message: "Organization deleted successfully",
        });

    } catch (error) {
        console.error("DELETE TENANCY ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete organization",
        });
    }
}
```
# Project Structure

```
└── api
    └── src
        └── controllers
            └── ticket.controller.js
```

# File Contents

## api/src/controllers/ticket.controller.js

```javascript
import { Ticket } from "../models/ticket.model.js";

export async function createTicket(req, res) {
    try {
        const { title, description, priority } = req.body;

        const userId = req.user.id;
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
            });
        }

        const ticket = await Ticket.create({
            title,
            description,
            priority,
            createdBy: userId,
            tenantId,
        });

        return res.status(201).json({
            message: "Ticket created successfully",
            ticket,
        });

    } catch (error) {
        console.error("CREATE TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to create ticket",
        });
    }
}


export async function fetchTicket(req, res) {
    try {

        const { ticketId } = req.params;
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            tenantId,
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            ticket,
        });

    } catch (error) {
        console.error("FETCH TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch ticket",
        });
    }
}


export async function fetchAllTickets(req, res) {
    try {
        
        const tenantId = req.user.tenantId;
        const userId = req.user.id;

        let tickets;

        if (tenantId) {
            tickets = await Ticket.find({ tenantId }).sort({ createdAt: -1 });
        } else {
            tickets = await Ticket.find({ createdBy: userId }).sort({ createdAt: -1 });
        }

        return res.status(200).json({ tickets });
    } catch (error) {
        console.error("FETCH ALL TICKETS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch tickets" });
    }
}


export async function deleteTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const ticket = await Ticket.findOneAndDelete({
            _id: ticketId,
            tenantId,
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            message: "Ticket deleted successfully",
        });

    } catch (error) {
        console.error("DELETE TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete ticket",
        });
    }
}


export async function updateTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const { title, description, priority, status } = req.body;

        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const ticket = await Ticket.findOneAndUpdate(
            {
                _id: ticketId,
                tenantId,
            },
            {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(priority !== undefined && { priority }),
                ...(status !== undefined && { status }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            message: "Ticket updated successfully",
            ticket,
        });

    } catch (error) {
        console.error("UPDATE TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to update ticket",
        });
    }
}
```
# Project Structure

```
└── api
    └── src
        └── middleware
            └── auth.middleware.js
```

# File Contents

## api/src/middleware/auth.middleware.js

```javascript
import jwt from "jsonwebtoken";


export function authenticate(req, res, next) {
    try {
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const token = authHeader.split(" ")[1];        
        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'development-secret'
        );
        
        req.user = {
            id: decoded.id,
            tenantId: decoded.tenantId,
            role: decoded.role,
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
```
# Project Structure

```
└── api
    └── src
        └── middleware
            └── auth.middleware.js
```

# File Contents

## api/src/middleware/auth.middleware.js

```javascript
import jwt from "jsonwebtoken";


export function authenticate(req, res, next) {
    try {
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const token = authHeader.split(" ")[1];        
        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'development-secret'
        );
        
        req.user = {
            id: decoded.id,
            tenantId: decoded.tenantId,
            role: decoded.role,
        };

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
```
# Project Structure

```
└── api
    └── src
        └── routes
            └── tenancy.route.js
```

# File Contents

## api/src/routes/tenancy.route.js

```javascript
import express from "express";

import {
    createTenancy,
    fetchTenancy,
    updateTenancy,
    deleteTenancy,
} from "../controllers/tenancy.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createTenancy);

router.get("/", authenticate, fetchTenancy);

router.patch("/", authenticate, updateTenancy);

router.delete("/", authenticate, deleteTenancy);

export default router;
```# Project Structure

```
└── api
    └── src
        └── routes
            └── ticket.route.js
```

# File Contents

## api/src/routes/ticket.route.js

```javascript
import express from "express";

import {
    createTicket,
    fetchTicket,
    fetchAllTickets,
    deleteTicket,
    updateTicket,
} from "../controllers/ticket.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
console.log("hge");

router.post("/", createTicket);

router.get("/", fetchAllTickets);

router.get("/:ticketId", fetchTicket);

router.patch("/:ticketId", updateTicket);

router.delete("/:ticketId", deleteTicket);

export default router;
```
# Project Structure

```
└── api
    └── src
        └── utils
            └── jwtTokenGenerator.js
```

# File Contents

## api/src/utils/jwtTokenGenerator.js

```javascript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";

export function generateAccessToken(user) {
    if (!user?._id) {
        throw new Error("User ID is missing");
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            tenantId: user.tenantId ? user.tenantId.toString() : null,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
}
```
# Project Structure

```
└── api
    └── src
        └── utils
            └── db.connection.js
```

# File Contents

## api/src/utils/db.connection.js

```javascript
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
```
##frontend

# Project Structure

```
└── web
    └── auth.ts
```

# File Contents

## web/auth.ts

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const url =
          process.env.BACKEND_URL || "http://localhost:2000";

        const response = await fetch(
          `${url}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        if (!response.ok) {
          return null
        }

        const user = await response.json();

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          accessToken: user.accessToken,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name as string;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },
});
```

# Project Structure

```
└── web
    └── next-auth.d.ts
```

# File Contents

## web/next-auth.d.ts

```typescript
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    tenantId?: string | null;
    accessToken?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      username?: string;
      role?: string;
      tenantId?: string | null;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: string;
    tenantId?: string | null;
    accessToken?: string;
  }
}

```
# Project Structure

```
└── web
    └── lib
        └── auth
            └── session.ts
```

# File Contents

## web/lib/auth/session.ts

```typescript
import { auth } from "@/auth";


export async function getCurrentUserSession() {
    const session = await auth();
    return session?.user ?? null;
}

export async function isAuthenticated() {
    const session = await auth();
    if(!session) return false
    return !!session?.user;
}
```


# Project Structure

```
└── web
    └── middleware.ts
```

# File Contents

## web/middleware.ts

```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isPublicPage = ["/", "/login", "/signup"].includes(req.nextUrl.pathname);

    if (!isLoggedIn && !isPublicPage) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```
# Project Structure

```
└── web
    └── app
        └── api
            └── auth
                └── [...nextauth]
                    └── route.ts
```

# File Contents

## web/app/api/auth/[...nextauth]/route.ts

```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```
# Project Structure

```
└── web
    └── shared
        └── services
            └── auth.service.ts
```

# File Contents

## web/shared/services/auth.service.ts

```typescript
export async function signupUser(formData: { username?: string, email?: string, password?: string, role?: string }) {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";    
    const response = await fetch(`${url}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
    }
    return response.json();
}
```# Project Structure

```
└── web
    └── shared
        └── services
            └── tenat.service.ts
```

# File Contents

## web/shared/services/tenat.service.ts

```typescript
import { Tenant, CreateTenantData } from "../types";

const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";

function authHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
}

export async function createTenant({ name, slug }: CreateTenantData, accessToken: string): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ name, slug }),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to create organization");
    }
    return result.tenancy;
}

export async function getTenant(accessToken: string): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "GET",
        cache: "no-store",
        headers: authHeaders(accessToken),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch organization");
    }
    return result.tenancy;
}

export async function updateTenant(data: Partial<CreateTenantData>, accessToken: string): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "PATCH",
        headers: authHeaders(accessToken),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to update organization");
    }
    return result.tenancy;
}

export async function deleteTenant(accessToken: string): Promise<void> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "DELETE",
        headers: authHeaders(accessToken),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to delete organization");
    }
}
```# Project Structure

```
└── web
    └── shared
        └── services
            └── tickets.service.ts
```

# File Contents

## web/shared/services/tickets.service.ts

```typescript
import { Ticket, CreateTicketData, UpdateTicketData } from "../types";
const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";


function authHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
}
export async function createTicket(data: CreateTicketData,accessToken:string): Promise<Ticket> {
    console.log("create ticket")
    const response = await fetch(`${url}/api/tickets`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ title: data.title, description: data.description, priority: data.priority }),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to create ticket");
    }
    return result.ticket;
}
export async function getTickets(accessToken: string): Promise<Ticket[]> {
    console.log("get tickets");

    const response = await fetch(`${url}/api/tickets`, {
        method: "GET",
        cache: "no-store",
        headers : authHeaders(accessToken),
    });
    const result = await response.json();
    console.log(result);
    
    if (!response.ok) {
        throw new Error(result.message  || "Failed to fetch tickets");
    }
    return result.tickets;
}

export async function getTicket(ticketId: string,accessToken: string): Promise<Ticket> {
    console.log("get ticket");
    
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "GET",
        headers: authHeaders(accessToken),
        cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch ticket");
    }
    return result.ticket;
}

export async function updateTicket(ticketId: string, data: UpdateTicketData,accessToken:string): Promise<Ticket> {
    console.log("update ticket");
    
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: authHeaders(accessToken),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to update ticket");
    }
    return result.ticket;
}

export async function deleteTicket(ticketId: string,accessToken:string): Promise<void> {
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: authHeaders(accessToken),
    });
    console.log("delete ticket");
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to delete ticket");
    }
}
```
# Project Structure

```
└── web
    └── features
        └── auth
            └── hooks
                └── useAuth.ts
```

# File Contents

## web/features/auth/hooks/useAuth.ts

```typescript
import { useSession } from "next-auth/react";

export function useAuth() {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const userData = session?.user ?? null;

    return {
        userData,
        loading,
        session,
    };
}



// export function useSignup(username:string,email: string, password: string,role:string) {
//     const router = useRouter();
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const createUser = async () => {
//         setError("");
//         setLoading(true);
//         try {
//             await signupUser({ username, email, password, role: role || "customer" });

//             if (role === "organization") {
//                 // If org, they need to log in and create a tenant
//                 router.push("/login?setup=true");
//             } else {
//                 router.push("/login");
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : "Signup failed");
//         } finally {
//             setLoading(false);
//         }
//     }
// }
```# Project Structure

```
└── web
    └── features
        └── tenants
            └── hooks
                └── useTenants.ts
```

# File Contents

## web/features/tenants/hooks/useTenants.ts

```typescript
import { useState, useCallback } from "react";
import { Tenant, CreateTenantData } from "../../../shared/types";
import { useSession } from "next-auth/react";
import {
    createTenant as apiCreateTenant,
    getTenant as apiGetTenant,
    updateTenant as apiUpdateTenant,
    deleteTenant as apiDeleteTenant
} from "../../../shared/services/tenat.service";

export function useTenants() {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken as string | undefined;

    const loadTenant = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            setError("");
            const data = await apiGetTenant(accessToken);
            setTenant(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tenant");
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    const createTenant = async (data: CreateTenantData) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setLoading(true);
            setError("");
            const newTenant = await apiCreateTenant(data, accessToken);
            setTenant(newTenant);
            return { success: true, tenant: newTenant };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create tenant";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateTenant = async (data: Partial<CreateTenantData>) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setLoading(true);
            setError("");
            const updated = await apiUpdateTenant(data, accessToken);
            setTenant(updated);
            return { success: true, tenant: updated };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update tenant";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteTenant = async () => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setLoading(true);
            setError("");
            await apiDeleteTenant(accessToken);
            setTenant(null);
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete tenant";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        tenant,
        loading,
        error,
        createTenant,
        loadTenant,
        updateTenant,
        deleteTenant,
    };
}

```
# Project Structure

```
└── web
    └── features
        └── tickets
            └── hooks
                └── useTickets.ts
```

# File Contents

## web/features/tickets/hooks/useTickets.ts

```typescript
import { useState, useEffect, useCallback, useMemo } from "react";
import { Ticket, TicketStatus, CreateTicketData, UpdateTicketData } from "../../../shared/types";
import { getTickets, createTicket as apiCreateTicket, updateTicket as apiUpdateTicket, deleteTicket as apiDeleteTicket } from "../../../shared/services/tickets.service";
import { useSession } from "next-auth/react";

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken as string | undefined;

    const loadTickets = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            
            setError("");
            const data = await getTickets(accessToken);
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const createTicket = async (data: CreateTicketData) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setError("");
            const newTicket = await apiCreateTicket(data, accessToken);
            setTickets((current) => [newTicket, ...current]);
            return { success: true, ticket: newTicket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const updateTicket = async (id: string, data: UpdateTicketData) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setError("");
            const updated = await apiUpdateTicket(id, data, accessToken);
            setTickets((current) => current.map((t) => (t._id === id ? updated : t)));
            return { success: true, ticket: updated };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const deleteTicket = async (id: string) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setError("");
            console.log("se");
            
            await apiDeleteTicket(id, accessToken);
            setTickets((current) => current.filter((t) => t._id !== id));
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const matchesSearch =
                ticket.title.toLowerCase().includes(search.toLowerCase()) ||
                ticket.description.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tickets, search, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter((t) => t.status === "open").length,
            inProgress: tickets.filter((t) => t.status === "in_progress").length,
            resolved: tickets.filter((t) => t.status === "resolved").length,
        };
    }, [tickets]);

    return {
        tickets,
        filteredTickets,
        stats,
        loading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        createTicket,
        updateTicket,
        deleteTicket,
        reload: loadTickets,
    };
}

```

# Project Structure

```
└── web
    └── shared
        └── types
            └── index.ts
```

# File Contents

## web/shared/types/index.ts

```typescript
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
    _id: string;
    tenantId: string;
    createdBy: string;
    assignedTo?: string | null;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category?: string | null;
    tags: string[];
    resolvedAt?: string | null;
    closedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTicketData {
    title: string;
    description: string;
    priority?: TicketPriority;
}

export interface UpdateTicketData {
    title?: string;
    description?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
}

export interface Tenant {
    _id: string;
    name: string;
    slug: string;
    email?: string;
    status: "active" | "suspended" | "deleted";
    plan: "free" | "pro" | "enterprise";
    createdAt: string;
    updatedAt: string;
}

export interface CreateTenantData {
    name: string;
    slug: string;
}
export interface UserData {
    id: string,
    name: string,
    email: string,
    role: string | null,
    tenantId: string | null,
    accessToken: string | null,
}
```






















