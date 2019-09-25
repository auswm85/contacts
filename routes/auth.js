import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { check, validationResult, sanitizeBody } from "express-validator";
import models from "../models";

const router = Router();

router.post(
  "/",
  [
    check("email")
      .isEmail()
      .withMessage("Invalid email address"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 characters long"),
    sanitizeBody("email").trim()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map(e => e.msg) });
    }

    try {
      const { email, password } = req.body;
      const user = await models.User.findOne({
        where: { email: email }
      });

      if (!user) {
        return res
          .status(401)
          .json({ errors: ["Invalid email/password combination"] });
      }

      const success = await bcrypt.compare(password, user.password);

      if (!success) {
        return res
          .status(401)
          .json({ errors: ["Invalid email/password combination"] });
      }

      const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET);

      return res.json({ auth: true, token });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
