export const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
};
