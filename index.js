import "dotenv/config";
import express from "express";
import helmet from "helmet";
import uuid from "uuid";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import models, { sequelize } from "./models";
import routes from "./routes";
import { hashPassword } from "./helpers";

const app = express();
const router = express.Router();
const logFmt = ':id [:date[web]]" :method :url" :status :response-time';
const corsOpts = { origin: "*", optionsSuccessStatus: 200 };
const port = process.env.PORT || 5000;
const dbReset = process.env.DB_RESET || false;

app.use(cors(corsOpts));
app.use(router);
app.use(helmet());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(
  morgan(logFmt, {
    skip: (req, res) => res.statusCode < 400,
    stream: process.stderr
  })
);

app.use(
  morgan(logFmt, {
    skip: (req, res) => res.statusCode > 400,
    stream: process.stdout
  })
);

app.use((req, res, next) => {
  req.id = uuid.v4();
  next();
});

morgan.token("id", req => req.id);

app.use("/v1/contacts", routes.contacts);
app.use("/v1/users", routes.users);
app.use("/v1/auth", routes.auth);

sequelize.sync({ force: dbReset }).then(async () => {
  app.listen(port, () => {
    console.log(`contact server listening on port ${port}`);
  });

  if (dbReset) {
    seedDb();
  }
});

const seedDb = async () => {
  const password = await hashPassword(process.env.TEST_PASSWORD);

  const user = {
    email: "jo@fakeemail.com",
    name: "Jo Schmo",
    password: password
  };

  const contacts = [
    {
      name: "Jack Schmo",
      email: "jack@fakeemail.com",
      contactType: "personal",
      phone: "123-124-5555"
    },
    {
      name: "Jill Schmo",
      email: "jill@fakeemail.com",
      contactType: "personal",
      phone: "123-124-5554"
    }
  ];

  try {
    const testUsr = await models.User.create(user);

    contacts.forEach(async contact => {
      contact.userId = testUsr.id;

      await models.Contact.create(contact);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = app;
