import { Router } from "express";
import { check, sanitizeBody, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { hashPassword } from "../helpers";
import models from "../models";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ["password"] }
    });
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
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

router.get("/:id", async (req, res, next) => {
  try {
    const user = await models.User.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ["password"] }
    });

    if (!user) return res.status(404).json({ msg: "user not found" });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/contacts", async (req, res, next) => {
  try {
    const { id } = req.params;
    const contacts = await models.Contact.findAll({
      where: { userId: id },
      attributes: { exclude: ["userId"] }
    });

    return res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/contacts", async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = { ...req.body };
    contact.userId = id;

    const createdContact = await models.Contact.create(contact);
    const { userId } = createdContact;

    return res.json({ userId, ...createdContact });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/register",
  [
    check("email")
      .isEmail()
      .withMessage("Invalid email address"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 characters long")
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.passwordConfirmation) {
          throw new Error("passwords do not match");
        } else {
          return value;
        }
      }),
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name is required"),
    sanitizeBody("email")
      .trim()
      .normalizeEmail(),
    sanitizeBody("name").trim()
  ],
  async (req, res, next) => {
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
  }
);

export default router;
