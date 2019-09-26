import { Router } from "express";
import { validationResult } from "express-validator";
import models from "../models";
import auth from "../middleware/auth";
import validate, { UPDATE_CONTACT } from "../middleware/validate";

const router = Router();

router.use(auth);

router.put("/:id", validate(UPDATE_CONTACT), async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => e.msg) });
  }

  try {
    const { user } = req;
    const { id } = req.params;
    const contact = await models.Contact.findByPk(id);

    if (!contact) return res.sendStatus(404);

    if (user.id !== parseInt(contact.userId)) return res.sendStatus(401);

    if (req.body.contactType) {
      contact.contactType = req.body.contactType;
    }

    if (req.body.phone) {
      contact.phone = req.body.phone;
    }

    if (req.body.email) {
      contact.email = req.body.email;
    }

    if (req.body.name) {
      contact.name = req.body.name;
    }

    const data = {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    };

    await contact.save();
    return res.json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const contact = await models.Contact.findByPk(id);

    if (!contact) return res.sendStatus(404);

    if (user.id !== parseInt(id)) return res.sendStatus(401);

    await contact.destroy();
    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
