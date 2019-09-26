import { check, sanitizeBody } from "express-validator";

export const AUTHENTICATE = "AUTHENTICATE";
export const REGISTER = "REGISTER";
export const USER_CONTACTS = "USER_CONTACTS";

export default method => {
  switch (method) {
    case REGISTER:
      return [
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
      ];
    case USER_CONTACTS:
      return [
        check("name")
          .not()
          .isEmpty()
          .withMessage("Name is required"),
        check("contactType")
          .isIn(["personal", "professional"])
          .withMessage("contactType must be personal or professional"),
        check("email")
          .isEmail()
          .withMessage("Invalid email address"),
        sanitizeBody("email"),
        sanitizeBody("name"),
        sanitizeBody("phone")
      ];
    case AUTHENTICATE:
      return [
        check("email")
          .isEmail()
          .withMessage("Invalid email address"),
        check("password")
          .isLength({ min: 5 })
          .withMessage("Password must be at least 5 characters long"),
        sanitizeBody("email").trim()
      ];
    default:
      return [];
  }
};
