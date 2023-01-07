require("dotenv").config();
const jwt = require("jsonwebtoken");

const privateKey = "helloFahad";

const generateAuthToken = ({ username, email, id }) =>
  jwt.sign({ username, email, id }, privateKey);

const verifyAuthToken = (token) => jwt.verify(token, privateKey);

module.exports = {
  generateAuthToken,
  verifyAuthToken,
};
