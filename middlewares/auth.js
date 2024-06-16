const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get the token from the request headers or body
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "Unauthorize access" });
    }
    // Token is valid, attach decoded user information to the request object
    req.user = decoded;

    next(); // Call the next middleware
  });
};

module.exports = verifyToken;
