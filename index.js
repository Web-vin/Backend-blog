const express = require("express")
const app = express();
const port = 5000;
const db = require("./db")
const cors = require("cors")

// Middleware to parse JSON requests
app.use(express.json());

app.use(cors()); 
app.use(cors({
    origin: "http://localhost:3000", // Allow only React frontend
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.get("/", (req, res)=>{
     res.json("hello duniya")
})
const authRoutes = require("./Routes/auth"); // Adjust the path as needed
app.use("/api/auth", authRoutes);
app.use('/api/userauth', require("./Routes/userRoutes"))
app.use('/api/blog', require('./Routes/blogRoutes'))
app.listen(port, ()=>{
    console.log(`app listening on port ${port}`)
})