import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    let token;

    // token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.id; // store user id
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }

  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};