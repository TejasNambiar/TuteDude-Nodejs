const Heading = require("../schema/heading");
const Task = require("../schema/task");

/**
 * Controller module for Headings and Tasks.
 * - `Heading`: list-level metadata (title, summary, tasks[])
 * - `Task`: individual task linked to a `Heading`
 *
 * Each exported function is an Express handler: (req, res) => Promise|void
 */

/**
 * Health / placeholder endpoint.
 * GET /api/
 */
exports.getAllEntitys = (req, res) => {
  res.status(200).json({ success: true, data: [], message: "Get all entitys" });
};

// ---------------------- Headings (lists) ----------------------

/**
 * Create a new Heading.
 * Expects JSON body: { title: string, summary?: string }
 * Returns 201 with created heading document.
 */
exports.createHeading = async (req, res) => {
  try {
    const { title, summary } = req.body;
    const heading = await Heading.create({ title, summary });
    res.status(201).json({ success: true, data: heading });
  } catch (err) {
    // Generic server error; keep message minimal for clients.
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * List all headings (lightweight fields).
 * GET /api/headings
 */
exports.getAllHeadings = async (req, res) => {
  try {
    // Select a small set of fields appropriate for a listing view.
    const headings = await Heading.find().select(
      "title summary tasks createdAt"
    );
    res.status(200).json({ success: true, data: headings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get a single heading by id, populated with its tasks.
 * GET /api/headings/:id
 */
exports.getHeadingById = async (req, res) => {
  try {
    const { id } = req.params;
    // Populate tasks only when full details are requested.
    const heading = await Heading.findById(id).populate("tasks");
    if (!heading)
      return res
        .status(404)
        .json({ success: false, message: "Heading not found" });
    res.status(200).json({ success: true, data: heading });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update a heading's fields.
 * PUT /api/headings/:id
 */
exports.updateHeading = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const heading = await Heading.findByIdAndUpdate(id, updates, { new: true });
    if (!heading)
      return res
        .status(404)
        .json({ success: false, message: "Heading not found" });
    res.status(200).json({ success: true, data: heading });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Delete a heading and cascade-delete its tasks.
 * DELETE /api/headings/:id
 *
 * Rationale: tasks are dependent on a heading. Removing the heading
 * should remove its tasks to avoid orphan records.
 */
exports.deleteHeading = async (req, res) => {
  try {
    const { id } = req.params;
    const heading = await Heading.findById(id);
    if (!heading)
      return res
        .status(404)
        .json({ success: false, message: "Heading not found" });

    // Cascade delete: remove all tasks referencing this heading.
    await Task.deleteMany({ heading: heading._id });

    // Remove the heading document itself.
    await heading.remove();

    res
      .status(200)
      .json({ success: true, message: "Heading and its tasks deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------------- Tasks ----------------------

/**
 * Create a new Task under a Heading.
 * POST /api/headings/:headingId/tasks
 * Body: { title, description?, dueDate?, priority? }
 * Behavior: creates Task, then pushes task._id into heading.tasks for quick access/order.
 */
exports.createTask = async (req, res) => {
  try {
    const { headingId } = req.params;
    const { title, description, dueDate, priority } = req.body;

    // Ensure heading exists before creating child task.
    const heading = await Heading.findById(headingId);
    if (!heading)
      return res
        .status(404)
        .json({ success: false, message: "Heading not found" });

    const task = await Task.create({
      heading: heading._id,
      title,
      description,
      dueDate,
      priority,
    });

    // Keep a reference in the parent for quick listing and ordering.
    heading.tasks.push(task._id);
    await heading.save();

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * List tasks that belong to a specific heading.
 * GET /api/headings/:headingId/tasks
 */
exports.getTasksByHeading = async (req, res) => {
  try {
    const { headingId } = req.params;
    const tasks = await Task.find({ heading: headingId });
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get a single task by id.
 * GET /api/tasks/:id
 */
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate("heading");
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update a task's fields.
 * PUT /api/tasks/:id
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Delete a task and remove its reference from the parent heading.
 * DELETE /api/tasks/:id
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    // Remove the task's id from the parent's tasks array to keep data consistent.
    await Heading.findByIdAndUpdate(task.heading, {
      $pull: { tasks: task._id },
    });
    await task.remove();

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
