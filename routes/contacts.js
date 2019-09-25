import { Router } from "express";
import Contact from "../models/contact";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.findAll();
    return res.json(contacts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { contact } = req.body;
    const newContact = await Contact.create(contact);
    return res.json(newContact);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
