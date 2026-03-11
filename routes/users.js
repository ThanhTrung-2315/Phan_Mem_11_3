var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET all users
router.get('/', async function (req, res, next) {
  try {
    let result = await userModel.find({ isDeleted: false }).populate({
      path: 'role',
      select: "name description"
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching users",
      error: error.message
    });
  }
});

// GET user by ID
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id).populate({
      path: 'role',
      select: "name description"
    });
    if (!result || result.isDeleted) {
      res.status(404).send({
        message: "User not found"
      });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(404).send({
      message: "User not found"
    });
  }
});

// CREATE new user
router.post('/', async function (req, res, next) {
  try {
    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName || "",
      avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
      status: req.body.status || false,
      role: req.body.role,
      loginCount: req.body.loginCount || 0
    });
    let result = await newUser.save();
    res.send(result);
  } catch (error) {
    res.status(400).send({
      message: "Error creating user",
      error: error.message
    });
  }
});

// UPDATE user
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updateData = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount
    };
    // Remove undefined properties
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    let result = await userModel.findByIdAndUpdate(id, updateData, { new: true }).populate({
      path: 'role',
      select: "name description"
    });
    if (!result || result.isDeleted) {
      res.status(404).send({
        message: "User not found"
      });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(400).send({
      message: "Error updating user",
      error: error.message
    });
  }
});

// DELETE user (soft delete)
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!result) {
      res.status(404).send({
        message: "User not found"
      });
    } else {
      res.send({
        message: "User deleted successfully",
        data: result
      });
    }
  } catch (error) {
    res.status(404).send({
      message: "Error deleting user"
    });
  }
});

// POST /enable - Enable user (set status to true)
router.post('/enable', async function (req, res, next) {
  try {
    let email = req.body.email;
    let username = req.body.username;
    
    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      });
    }

    let result = await userModel.findOneAndUpdate(
      { email: email, username: username, isDeleted: false },
      { status: true },
      { new: true }
    ).populate({
      path: 'role',
      select: "name description"
    });

    if (!result) {
      return res.status(404).send({
        message: "User not found with provided email and username"
      });
    }

    res.send({
      message: "User enabled successfully",
      data: result
    });
  } catch (error) {
    res.status(500).send({
      message: "Error enabling user",
      error: error.message
    });
  }
});

// POST /disable - Disable user (set status to false)
router.post('/disable', async function (req, res, next) {
  try {
    let email = req.body.email;
    let username = req.body.username;
    
    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      });
    }

    let result = await userModel.findOneAndUpdate(
      { email: email, username: username, isDeleted: false },
      { status: false },
      { new: true }
    ).populate({
      path: 'role',
      select: "name description"
    });

    if (!result) {
      return res.status(404).send({
        message: "User not found with provided email and username"
      });
    }

    res.send({
      message: "User disabled successfully",
      data: result
    });
  } catch (error) {
    res.status(500).send({
      message: "Error disabling user",
      error: error.message
    });
  }
});

module.exports = router;
