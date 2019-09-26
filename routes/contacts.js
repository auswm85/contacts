import { Router } from "express";
import models from "../models";
import auth from "../middleware/auth";

const router = Router();

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const contacts = await models.Contact.findAll();
    return res.json(contacts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { contact } = req.body;
    const newContact = await models.Contact.create(contact);
    return res.json(newContact);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
