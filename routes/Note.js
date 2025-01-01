const router = require('express').Router();
const Note = require('../models/Note.model');
const {body, param, matchedData, validationResult}= require('express-validator');

router.get('/', async(req,res)=>{
    const {user} = req.user;
    const notes = await Note.find({userId: user._id});
    res.status(200).json({
        data: notes
    });
})

router.post('/create-note',
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    async(req,res)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array().map((e)=>e.msg)});
        }

        const {user} = req.user;

        const note = new Note({
            title: req.body.title,
            content: req.body.content,
            tags: req.body.tags,
            userId: user._id
        })

        await note.save();
        return res.status(201).json({
            data: note,
        })
    })

router.delete('/delete/:id',param('id').notEmpty().withMessage('Note Id is required')
    .custom(async(id)=>{
        const noteId = await Note.findById(id);
        if (!noteId){
            throw new Error('Invalid Note Id');
        }
    })
    ,async(req,res)=>{
    const errors= validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array().map((e)=>e.msg)});
    }
    const id = req.params.id;
    await Note.findByIdAndDelete(id);
    res.status(204).json({
        data: "Note Deleted"
    });
})

module.exports = router