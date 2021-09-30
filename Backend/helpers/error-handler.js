function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
      //jwt authentication error handler
    return res.status(401).json({ message: "The user is not authorized" });
  }

  if(err.name === 'ValidationError'){
      //validation error handler
    return res.status(401).json({ message: err });
  }

  //default error to 500 server error handler
  return res.status(500).json({message: "Server error!"})
}
