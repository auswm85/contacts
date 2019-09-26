import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import models from "../models";
import validate, { AUTHENTICATE } from "../middleware/validate";

const router = Router();

router.post("/", validate(AUTHENTICATE), async (req, res, next) => {
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

    res.cookie("accessToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 900000),
      signed: true
    });

    return res.json({ auth: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

export default router;
