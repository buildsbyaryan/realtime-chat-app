const errorMiddleware = (
  err,
  req,
  res,
  next
) => {
  console.error("ERROR:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(
      err.errors
    ).map((error) => error.message);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Mongoose CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data",
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message:
      "Internal server error",
  });
};

module.exports = errorMiddleware;