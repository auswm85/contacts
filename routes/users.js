import { Router } from "express";
import { validationResult, query } from "express-validator";
import jwt from "jsonwebtoken";
import { hashPassword } from "../helpers";
import models from "../models";
import auth from "../middleware/auth";
import sortable from "../middleware/sortable";
import filterable from "../middleware/filterable";
import validate, {
  ADD_USER_CONTACT,
  REGISTER,
  UPDATE_USER
} from "../middleware/validate";

const router = Router();
const sortFilterCols = ["createdAt", "updatedAt", "email", "name"];

router.get(
  "/",
  [auth, sortable(sortFilterCols), filterable(sortFilterCols)],
  async (req, res, next) => {
    const { sorting, filtering } = req;
    const query = {
      attributes: { exclude: ["password"] }
    };

    if (filtering) {
      const filters = filtering.map(filter => {
        const { column, value } = filter;
        return {
          [column]: value
        };
      });

      query.where = filters;
    }

    if (sorting) query.order = sorting.map(s => [s.column, s.direction]);

    try {
      const users = await models.User.findAll(query);
      return res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(id, {
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

router.put("/:id", [auth, validate(UPDATE_USER)], async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => e.msg) });
  }

  try {
    const { user } = req;
    const { id } = req.params;
    const updateUsr = await models.User.findByPk(id);

    if (!updateUsr) return res.sendStatus(404);

    if (user.id !== parseInt(updateUsr.id)) return res.sendStatus(401);

    if (req.body.name) {
      updateUsr.name = req.body.name;
    }

    // if the email is being updated
    // and it doesn't match the users' existing
    // check to make sure it doesn't exist before updating
    if (req.body.email) {
      const { email } = req.body;

      if (email !== updateUsr.email) {
        const emailExists = await models.User.findOne({
          where: { email: email }
        });

        if (!emailExists) {
          updateUsr.email = email;
        } else {
          return res
            .send(400)
            .json({ errors: ["email already exists, please chooe another"] });
        }
      }
    }

    const data = {
      id: updateUsr.id,
      name: updateUsr.name,
      email: updateUsr.email,
      createdAt: updateUsr.createdAt,
      updatedAt: updateUsr.updatedAt
    };

    await updateUsr.save();
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get(
  "/:id/contacts",
  [auth, sortable(sortFilterCols), filterable(sortFilterCols)],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { sorting, filtering } = req;

      // if it's not the user requesting
      // deny access
      if (req.user.id !== parseInt(id)) {
        return res.send(401);
      }

      let where = { userId: id };
      const query = {
        attributes: { exclude: ["userId"] }
      };

      if (filtering) {
        const filters = filtering.map(filter => {
          const { column, value } = filter;
          return {
            [column]: value
          };
        });

        where = { ...where, ...filters.reduce((acc, curr) => curr) };
      }

      query.where = where;

      if (sorting) query.order = sorting.map(s => [s.column, s.direction]);

      const contacts = await models.Contact.findAll(query);

      return res.json(contacts);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:id/contacts",
  auth,
  validate(ADD_USER_CONTACT),
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
      .status(422)
      .json({ errors: ["Email is already in use, please choose another"] });
  }

  try {
    const hash = await hashPassword(password);
    user = { name, email, password: hash };

    const returnUsr = await models.User.create(user);
    const token = jwt.sign({ id: email }, process.env.JWT_SECRET);

    res.cookie("accessToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000 * 24 * 14),
      signed: true
    });

    return res.json({
      id: returnUsr.id,
      email,
      name,
      createdAt: returnUsr.createdAt
    });
  } catch (err) {
    return res
      .send(500)
      .json({ errors: ["Error occurred during registration"] });
  }
});

export default router;
