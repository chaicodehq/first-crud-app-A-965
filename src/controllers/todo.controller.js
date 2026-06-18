import { Todo } from "../models/todo.model.js";

/**
 * Create a new todo
 */
export async function createTodo(req, res, next) {
  try {
    const { title, completed, priority, tags, dueDate } = req.body;

    const todo = new Todo({
      title,
      completed,
      priority,
      tags,
      dueDate,
    });

    const savedTodo = await todo.save();

    return res.status(201).json(savedTodo);
  } catch (error) {
    next(error);
  }
}

/**
 * List todos with pagination and filters
 */
export async function listTodos(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      completed,
      priority,
      search,
    } = req.query;

    const filters = {};

    if (completed !== undefined) {
      filters.completed = completed === "true";
    }

    if (priority) {
      filters.priority = priority;
    }

    if (search) {
      filters.title = {
        $regex: search,
        $options: "i",
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Todo.countDocuments(filters);

    const todos = await Todo.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      data: todos,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single todo by ID
 */
export async function getTodo(req, res, next) {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });
    }

    return res.json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * Update todo by ID
 */
export async function updateTodo(req, res, next) {
  try {
    const { id } = req.params;

    const todo = await Todo.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!todo) {
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });
    }

    return res.json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle completed status
 */
export async function toggleTodo(req, res, next) {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });
    }

    todo.completed = !todo.completed;

    const updatedTodo = await todo.save();

    return res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete todo by ID
 */
export async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params;

    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}