import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const userDB = [];
app.get("/users", async (req, res) => {
  return res.json({ users: userDB });
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  //check if user is already present
  const findUser = userDB.find((user) => {
    if (user.email === email && user.name === name) {
      return true;
    }
  });

  if (findUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = { id: userDB.length + 1, name, email };

  userDB.push(newUser);

  return res
    .status(201)
    .json({ message: "User created successfully", user: newUser });
});

app.patch("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name && !email) {
    return res.status(400).json({ message: "Name or email is required" });
  }
  const getUser = userDB.find((user) => user.id === parseInt(id));
  if (!getUser) {
    return res.status(404).json({ message: "User not found" });
  }
  //the getUser object is a reference to the user object in the userDB array. So, when we update the getUser object, we are also updating the user object in the userDB array.
  if (name) {
    getUser.name = name;
  }
  if (email) {
    getUser.email = email;
  }

  return res
    .status(200)
    .json({ message: "User updated successfully", user: getUser });
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const getUserIndex = userDB.findIndex((user) => user.id === parseInt(id));
  if (getUserIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  userDB.splice(getUserIndex, 1);
  return res.status(200).json({ message: "User deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
