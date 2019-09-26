import { check, body, sanitizeBody } from "express-validator";

export const AUTHENTICATE = "AUTHENTICATE";
export const REGISTER = "REGISTER";
export const ADD_USER_CONTACT = "ADD_USER_CONTACT";
export const UPDATE_CONTACT = "UPDATE_CONTACT";

export default method => {
  switch (method) {
    case REGISTER:
      return [
        check("email", "Invalid email address").isEmail(),
        check("password")
          .isLength({ min: 5 })
          .withMessage("must be at least 5 characters long")
          .custom((value, { req }) => value !== req.body.passwordConfirmation)
          .withMessage("password must match the password confirmation."),
        check(
          "passwordConfirmation",
          "passwordConfirmation is required"
        ).exists(),
        check("name", "name is required")
          .not()
          .isEmpty(),
        sanitizeBody("email")
          .trim()
          .normalizeEmail(),
        sanitizeBody("name").trim()
      ];
    case ADD_USER_CONTACT:
      return [
        check("name", "name is required")
          .not()
          .isEmpty(),
        check(
          "contactType",
          "contactType must be personal or professional"
        ).isIn(["personal", "professional"]),
        check("email", "Invalid email address").isEmail(),
        check("phone", "Invalid phone number").isMobilePhone(),
        sanitizeBody("email"),
        sanitizeBody("name"),
        sanitizeBody("phone")
      ];
    case AUTHENTICATE:
      return [
        check("email", "Invalid email address").isEmail(),
        check(
          "password",
          "Password must be at least 5 characters long"
        ).isLength({ min: 5 }),
        sanitizeBody("email").trim()
      ];
    case UPDATE_CONTACT:
      return [
        body("email", "Invalid email address")
          .if((value, { req }) => req.body.email)
          .isEmail(),
        body("phone", "Invalid phone number")
          .if((value, { req }) => req.body.phone)
          .isMobilePhone(),
        body("contactType", "contactType must be personal or professional")
          .if((value, { req }) => req.body.contactType)
          .isIn(["personal", "professional"])
      ];
    default:
      return [];
  }
};
