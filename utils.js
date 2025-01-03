const jwt = require("jsonwebtoken");

function authenticateToken(req,res,next){
    const authheader = req.headers.authorization;
    if(authheader){
        const [type, token] = authheader.split(" ");

        if (type !== "Bearer") return res.status(401).json({
            message: "Unauthorized1"
        });
        if (!token) return res.status(401).json({
            message: "Unauthorized2"
        });
    
        jwt.verify(token, process.env.ACCESS_KEY_SECRET, (err,user)=>{
            if (err) return res.status(401);
            req.user = user;
            next();
        })
    }else{
        res.status(401).json({
            message: "Unauthorized3"
        })
    }
    
}

module.exports = {authenticateToken};