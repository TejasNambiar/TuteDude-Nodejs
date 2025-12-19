const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

// Root health
router.get("/", controller.getAllEntitys);

// Headings
router.post("/headings", controller.createHeading);
router.get("/headings", controller.getAllHeadings);
router.get("/headings/:id", controller.getHeadingById);
router.put("/headings/:id", controller.updateHeading);
router.delete("/headings/:id", controller.deleteHeading);

// Tasks (nested under headings for creation/listing)
router.post("/headings/:headingId/tasks", controller.createTask);
router.get("/headings/:headingId/tasks", controller.getTasksByHeading);

// Individual task operations
router.get("/tasks/:id", controller.getTaskById);
router.put("/tasks/:id", controller.updateTask);
router.delete("/tasks/:id", controller.deleteTask);

module.exports = router;
