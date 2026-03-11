var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET all roles
router.get('/', async function (req, res, next) {
  try {
    let result = await roleModel.find({ isDeleted: false });
    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Error fetching roles",
      error: error.message
    });
  }
});

// GET role by ID
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await roleModel.findById(id);
    if (!result || result.isDeleted) {
      res.status(404).send({
        message: "Role not found"
      });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(404).send({
      message: "Role not found"
    });
  }
});

// CREATE new role
router.post('/', async function (req, res, next) {
  try {
    let newRole = new roleModel({
      name: req.body.name,
      description: req.body.description || ""
    });
    let result = await newRole.save();
    res.send(result);
  } catch (error) {
    res.status(400).send({
      message: "Error creating role",
      error: error.message
    });
  }
});

// UPDATE role
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let updateData = {
      name: req.body.name,
      description: req.body.description
    };
    // Remove undefined properties
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    let result = await roleModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!result || result.isDeleted) {
      res.status(404).send({
        message: "Role not found"
      });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(400).send({
      message: "Error updating role",
      error: error.message
    });
  }
});

// DELETE role (soft delete)
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await roleModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!result) {
      res.status(404).send({
        message: "Role not found"
      });
    } else {
      res.send({
        message: "Role deleted successfully",
        data: result
      });
    }
  } catch (error) {
    res.status(404).send({
      message: "Error deleting role"
    });
  }
});

// GET /roles/:id/users - Get all users with specific role
router.get('/:id/users', async function (req, res, next) {
  try {
    let roleId = req.params.id;
    
    // First check if role exists
    let role = await roleModel.findById(roleId);
    if (!role || role.isDeleted) {
      return res.status(404).send({
        message: "Role not found"
      });
    }

    // Get all users with this role
    let result = await userModel.find({ 
      role: roleId,
      isDeleted: false 
    }).populate({
      path: 'role',
      select: "name description"
    });

    res.send({
      role: role,
      users: result,
      count: result.length
    });
  } catch (error) {
    res.status(500).send({
      message: "Error fetching users for role",
      error: error.message
    });
  }
});

module.exports = router;
