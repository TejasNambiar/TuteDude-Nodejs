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
