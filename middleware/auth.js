import jwt from "jsonwebtoken";
import models from "../models";

export default async (req, res, next) => {
  const { accessToken } = req.signedCookies || "";

  req.user = null;

  const clear = () => {
    res.clearCookie("accessToken");
    next();
  };

  if (!accessToken) {
    res.sendStatus(401);
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return clear();

    if (decoded.exp <= Date.now() / 1000) {
      return clear();
    }

    const data = jwt.decode(accessToken);
    const { id } = data;

    try {
      const user = await models.User.findOne({
        where: { email: id }
      });

      if (!user || user.email !== id) return clear();

      req.user = user;
      next();
    } catch (err) {
      return res.sendStatus(500);
    }
  });
};
