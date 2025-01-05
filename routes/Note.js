const router = require("express").Router();
const Note = require("../models/Note.model");
const User = require("../models/User.model");
const {
  query,
  body,
  param,
  matchedData,
  validationResult,
} = require("express-validator");

router.get('/user/info', async (req, res)=>{
    try{
        const {user} = req.user;
        const userInfo = await User.findById(user._id);

        if(!userInfo){
            return res.status(401).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            meta: {count: 1},
            data: userInfo,
        })
    }catch(e){
        res.status(500).json({
            error: e.message,
            message: "Internal Server Error"
        })
    }
})


router.get("/", async (req, res) => {
  try {
    const { user } = req.user;
    const notes = await Note.find({ userId: user._id }).sort({isPinned: -1,created_at: -1});
    res.status(200).json({
      meta: {
        count: notes.length,
      },
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Internal Server Error",
    });
  }
});

router.post(
  "/create-note",
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const { user } = req.user;

      const note = new Note({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags || [],
        isPinned: req.body.isPinned || false,
        userId: user._id,
      });

      await note.save();
      return res.status(201).json({
        data: note,
        message: "Note Created Successfully",
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
        message: "Internal Server Error",
      });
    }
  }
);

router.delete(
  "/delete/:id",
  param("id")
    .notEmpty()
    .withMessage("Note Id is required")
    .custom(async (id) => {
      const note = await Note.findById(id);
      if (!note) {
        throw new Error("Invalid Note Id");
      }
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const id = req.params.id;
      await Note.findByIdAndDelete(id);
      res.status(204).json({
        data: "Note Deleted",
      });
    } catch {
      res.status(500).json({
        error: e.message,
        message: "Internal Server Error",
      });
    }
  }
);

router.put(
  "/update/:id",
  param("id")
    .notEmpty()
    .withMessage("Note Id is required")
    .custom(async (id) => {
      const noteId = await Note.findById(id);
      if (!noteId) {
        throw new Error("Invalid Note Id");
      }
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const id = req.params.id;

      const note = await Note.findById(id);
      const { title, content, tags } = req.body;

      if (title) note.title = title;
      if (content) note.content = content;
      if (tags) note.tags = tags;
      note.created_at = new Date().getTime();

      await note.save();

      res.status(200).json({
        meta: {
          count: 1,
        },
        data: note,
        message: "Note is successfully updated",
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
        message: "Internal Server Error",
      });
    }
  }
);

router.patch(
  "/ispinned/:id",
  param("id")
    .notEmpty()
    .withMessage("Note Id is required")
    .custom(async (id) => {
      const noteId = await Note.findById(id);
      if (!noteId) {
        throw new Error("Invalid Note Id");
      }
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const id = req.params.id;

      const note = await Note.findById(id);
      const { isPinned } = req.body;

      if (isPinned) note.isPinned = isPinned;

      await note.save();

      res.status(200).json({
        meta: {
          count: 1,
        },
        data: note,
        message: "Note is successfully updated",
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
        message: "Internal Server Error",
      });
    }
  }
);

router.post('/search',
  query('searchKey').notEmpty().withMessage("Search query is required")
  ,async (req,res) => {
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array().map((e)=>e.msg)})
      }
      const {user} = req.user;
      const {searchKey} = req.query;

      const matchedNotes = await Note.find({
        userId: user._id,
        $or: [
          { title: {$regex: new RegExp(searchKey, "i")}},
          { content: {$regex: new RegExp(searchKey, "i")}},
          { tags: {$regex: new RegExp(searchKey, "i")}},
        ]
      })

      res.status(200).json({
        data: matchedNotes,
      })


    }catch(e){
      res.status(500).json({
        errors: e,
        message: "Internal Server Error"
      })
      
    }
})

module.exports = router;
