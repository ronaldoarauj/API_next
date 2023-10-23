import jwt from "jsonwebtoken";

const secret = "seu-segredo";

const payload = {
  id: 1,
  name: "John Doe",
  email: "johndoe@example.com",
};

const token = jwt.sign(payload, secret, {
  expiresIn: "1h",
});

console.log(token);

try {
  const payload = jwt.verify(token, secret);
  console.log(payload);
} catch (error) {
  console.log(error);
}