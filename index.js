const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"], // can be multiple
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) => {
  console.log("inside the logger");
  next();
};

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unAuthorized access" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0uhyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Database and collections sections
    const jobsCollection = client.db("jobPortal").collection("jobs");
    const jobApplicationCollection = client
      .db("jobPortal")
      .collection("job_applications");

    // Auth related APIs [JWT token]
    app.post("/jwt", async (req, res) => {
      console.log("JWT request received");

      const user = req.body;
      if (!user.email) {
        return res.status(400).send({ message: "Email is required" });
      }

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });

      console.log("Generated Token:", token);

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false, // set to true only if you're using HTTPS
        })
        .send({ success: true });
    });

    //----------------- All APIs -----------------//

    //--------------------------------------------//
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job is falling from the sky");
});

app.listen(port, () => {
  console.log(`Job is waiting at: ${port}`);
});
