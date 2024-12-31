const jwt = require("jsonwebtoken");

function authenticateToken(req,res,next){
    const authheader = req.headers.authentication;
    const [type, token] = authheader.split(" ");

    if (type !== "bearer") return res.status(401);
    if (!token) return res.status(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user)=>{
        if (err) return res.status(401);
        req.user = user;
        next();
    })
}

module.exports = {authenticateToken};