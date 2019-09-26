import { Router } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { hashPassword } from "../helpers";
import models from "../models";
import auth from "../middleware/auth";
import validate, { USER_CONTACTS, REGISTER } from "../middleware/validate";

const router = Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ["password"] }
    });
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = { name, email };
    const hash = await hashPassword(password);

    user.password = hash;

    const newUser = await models.User.create(user);

    return res.json({
      id: newUser.id,
      name,
      email,
      createdAt: newUser.createdAt
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await models.User.findOne({
      where: { id: id },
      attributes: { exclude: ["password"] }
    });

    if (!user) return res.status(404).json({ msg: "user not found" });

    // if it's not the user requesting
    // deny access
    if (req.user.id !== parseInt(id)) {
      return res.send(401);
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/contacts", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // if it's not the user requesting
    // deny access
    if (req.user.id !== parseInt(id)) {
      return res.send(401);
    }

    const contacts = await models.Contact.findAll({
      where: { userId: id },
      attributes: { exclude: ["userId"] }
    });

    return res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/contacts",
  auth,
  validate(USER_CONTACTS),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (req.user.id !== parseInt(id)) {
        return res.send(401);
      }

      const { name, email, phone, contactType } = req.body;
      const contact = { name, email, phone, contactType };
      contact.userId = id;

      const createdContact = await models.Contact.create(contact);
      const { userId } = createdContact;

      return res.json({ userId, ...createdContact });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/register", validate(REGISTER), async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => e.msg) });
  }

  const { name, email, password } = req.body;

  let user = await models.User.findOne({
    where: { email: email }
  });

  if (user) {
    return res
      .status(400)
      .json({ errors: ["Email taken, please choose another"] });
  }

  try {
    const hash = await hashPassword(password);
    user = { name, email, password: hash };

    const returnUsr = await models.User.create(user);
    const token = jwt.sign({ id: email }, process.env.JWT_SECRET);

    return res.json({
      id: returnUsr.id,
      email,
      name,
      createdAt: returnUsr.createdAt,
      token
    });
  } catch (err) {
    return res
      .send(500)
      .json({ errors: ["Error occurred during registration"] });
  }
});

export default router;
