const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const taskController = require("../controller/taskController");

// Root health
router.get("/", controller.getAllEntitys);

// Headings
router.post("/headings", controller.createHeading);
router.get("/headings", controller.getAllHeadings);
router.get("/headings/:id", controller.getHeadingById);
router.put("/headings/:id", controller.updateHeading);
router.delete("/headings/:id", controller.deleteHeading);

// Tasks (nested under headings for creation/listing)
router.post("/headings/:headingId/tasks", taskController.createTask);
router.get("/headings/:headingId/tasks", taskController.getTasksByHeading);

// Individual task operations
router.get("/tasks/:id", taskController.getTaskById);
router.put("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);

module.exports = router;
