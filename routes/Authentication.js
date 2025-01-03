const router = require("express").Router();
const jwt = require("jsonwebtoken");
const {body, matchedData, validationResult} = require("express-validator");
const User= require('../models/User.model')

router.post('/create-user', body('username').notEmpty().withMessage('Username is required')
                        ,body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email is not valid').custom(async (email)=>{
                            const takenEmail = await User.findOne({email: email});
                            if (takenEmail){
                                throw new Error('Email already exists');
                            }
                        })
                        ,body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
                        , async(req,res)=>{
                            const errors = validationResult(req);
                            if (!errors.isEmpty()){
                                return res.status(400).json({ errors: errors.array().map((e)=>e.msg) });
                            }

                            const user = new User(matchedData(req));

                            await user.save();

                            const Token = jwt.sign({user}, process.env.ACCESS_KEY_SECRET, {expiresIn: '1h'})

                            return res.status(201).json({
                                data: user,
                                Token: Token
                            })
                        }
)

router.post('/login', 
    body('email').notEmpty().withMessage('Email is required')
    ,body('password')
    .custom(async(password)=>{
        const hasPsw = await User.findOne({password: password});
        if (!hasPsw){
            throw new Error('Incorrect Password');
        }
    })
    ,async(req, res) => {
        const errors = validationResult(req);
        const requiredEmail = errors.array().filter((e)=>{
            if (e.msg === "Email is required"){
                return e;
            }
        })

        if (requiredEmail.length > 0){
            return res.status(400).json({errors: "Email is required"});
        }
        
        const checkEmail = await User.findOne({email: req.body.email});
        if (!checkEmail){
            return res.status(400).json({errors: "Email does not Exist"})
        }

        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array().map((e)=>e.msg) });
        }

        const user = await User.findOne({email: req.body.email});
        const Token = jwt.sign({user}, process.env.ACCESS_KEY_SECRET, {expiresIn: '1h'});
        return res.status(200).json({
            data: user,
            Token: Token
        })
})


module.exports = router;