import express from "express";
import cors from "cors";
import { config } from "dotenv";

import dialogflow from "@google-cloud/dialogflow";
import { Payload, Suggestion, WebhookClient } from "dialogflow-fulfillment";

import mongoose from "mongoose";

import nodemailer from "nodemailer";
import argon2 from "argon2";

config();

const mongoString =
  "mongodb+srv://aimal4910:aimal%40123MongoDbDev@cluster0.a9qcv.mongodb.net/eChatbot";
const database = mongoose.connection;

const app = express();

app.use(express.json());

app.use(cors());

app.listen(3001, () => {
  console.log(`Server started at ${3001}`);
});

mongoose.connect(mongoString);

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", async () => {
  console.log("Database Connected");
});

const projectId = "e-chatbot-ttuu";

const sessionId = "123456";

const languageCode = "en";

const sessionClient = new dialogflow.SessionsClient(
  "C:UsersAimalAppDataRoaminggcloudapplication_default_credentials.json"
);

const imageSchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productQuantity: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerContact: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
  },
  orderDate: {
    type: Date,
    default: Date.now(),
  },
});

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
  },
  senderMessage: {
    type: String,
    required: true,
  },
  messageDate: {
    type: Date,
    default: Date.now(),
  },
});

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  userContact: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: Date.now(),
  },
});

const imageModel = mongoose.model("clothes", imageSchema);
const imageModel2 = mongoose.model("watches", imageSchema);
const imageModel3 = mongoose.model("shoes", imageSchema);

const orderModel = mongoose.model("orders", orderSchema);

const messageModel = mongoose.model("messages", messageSchema);

const userModel = mongoose.model("users", userSchema);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "aimaldeveloper@gmail.com",
    pass: "wgma kpsp twvk gfwo",
  },
});

app.post("/query", async (req, res) => {
  const query = req.body.message;

  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);

    const fulfillmentText = responses[0].queryResult.fulfillmentMessages;

    res.json({
      text: fulfillmentText,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

app.post("/webhook", async (req, res) => {
  const agent = new WebhookClient({
    request: req,
    response: res,
  });

  function welcome(agent) {
    agent.add("Hi! How Can I Help You?");
    agent.add(new Suggestion("Products"));
    agent.add(new Suggestion("Order Status"));
    agent.add(new Suggestion("Contact Us"));
  }

  function ShowProducts(agent) {
    agent.add("These Are Our Products");
    agent.add(new Suggestion("Clothes"));
    agent.add(new Suggestion("Watches"));
    agent.add(new Suggestion("Shoes"));
  }

  async function clothes(agent) {
    const clothesImgMap = await imageModel.find({});
    let payloadData = {
      clothesImages: clothesImgMap,
    };
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function watches(agent) {
    const watchesImgMap = await imageModel2.find({});
    let payloadData = {
      watchesImages: watchesImgMap,
    };
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function shoes(agent) {
    const shoesImgMap = await imageModel3.find({});
    let payloadData = {
      shoesImages: shoesImgMap,
    };
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function productConfirmClothes(agent) {
    const productImg = await imageModel.findById(
      req.body.queryResult.queryText.split(",")[1]
    );

    const payloadData = {
      text: "Do you want to buy this product?",
      productImage: productImg,
      confirmOptions: {
        yes: "Yes",
        no: "No",
      },
    };
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function productConfirmWatches(agent) {
    const watchImg = await imageModel2.findById(
      req.body.queryResult.queryText.split(",")[1]
    );

    const payloadData = {
      textWatch: "Do you want to buy this product?",
      watchImage: watchImg,
      confirmOptions: {
        yes: "Yes",
        no: "No",
      },
    };
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function productConfirmShoes(agent) {
    const shoesImg = await imageModel3.findById(
      req.body.queryResult.queryText.split(",")[1]
    );

    const payloadData = {
      textShoes: "Do you want to buy this product?",
      shoesImage: shoesImg,
      confirmOptions: {
        yes: "Yes",
        no: "No",
      },
    };
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function IfUserSaysNo(agent) {
    agent.add("Fine! You can check our other products.");
    agent.add(new Suggestion("Clothes"));
    agent.add(new Suggestion("Watches"));
    agent.add(new Suggestion("Shoes"));
  }

  async function CustomerDetailsForCloth(agent) {
    const payloadData = {
      text: "Please Enter Your Details",
    };

    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function CustomerDetailsForWatch(agent) {
    const payloadData = {
      textWatch: "Please Enter Your Details",
    };

    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function CustomerDetailsForShoes(agent) {
    const payloadData = {
      textShoes: "Please Enter Your Details",
    };

    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function SaveOrderForCloth(agent) {
    const payloadData = {
      emailTextForCloth: `An email has been sent to your email address with your tracking Id.`,
    };

    agent.add("Your order has been placed.");
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function SaveOrderForWatch(agent) {
    const payloadData = {
      emailTextForWatch: `An email has been sent to your email address with your tracking Id.`,
    };

    agent.add("Your order has been placed.");
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function SaveOrderForShoes(agent) {
    const payloadData = {
      emailTextForShoes: `An email has been sent to your email address with your tracking Id.`,
    };

    agent.add("Your order has been placed.");
    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function checkOrderStatus(agent) {
    const payloadData = {
      orderStatusText: "Please Enter Your Tracking Id",
    };

    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  async function contactUs(agent) {
    const payloadData = {
      contactUsText: "Please Enter Your Details",
    };

    agent.add(
      new Payload("UNSPECIFIED", payloadData, {
        sendAsMessage: true,
        rawPayload: true,
      })
    );
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Show Products", ShowProducts);

  intentMap.set("Clothes-Id - no", IfUserSaysNo);
  intentMap.set("Watch-Id - no", IfUserSaysNo);
  intentMap.set("Shoes-Id - no", IfUserSaysNo);

  intentMap.set("Show Clothes", clothes);
  intentMap.set("Clothes-Id", productConfirmClothes);
  intentMap.set("Clothes-Id - yes", CustomerDetailsForCloth);
  intentMap.set("Save Order For Cloth", SaveOrderForCloth);

  intentMap.set("Show Watches", watches);
  intentMap.set("Watch-Id", productConfirmWatches);
  intentMap.set("Watch-Id - yes", CustomerDetailsForWatch);
  intentMap.set("Place Order For Watch", SaveOrderForWatch);

  intentMap.set("Show Shoes", shoes);
  intentMap.set("Shoes-Id", productConfirmShoes);
  intentMap.set("Shoes-Id - yes", CustomerDetailsForShoes);
  intentMap.set("Save Order For Shoes", SaveOrderForShoes);

  intentMap.set("Order Status", checkOrderStatus);

  intentMap.set("Contact Us", contactUs);

  agent.handleRequest(intentMap);
});

app.post("/image", async (req) => {
  const imageName = req.body.imageName;
  const imageUrl = req.body.imageUrl;

  const parsedImgName = JSON.parse(imageName);
  const onlyImageName = parsedImgName.split(".")[0];
  const parsedUrl = JSON.parse(imageUrl);

  await imageModel.create({
    imageName: onlyImageName,
    imageUrl: parsedUrl,
  });
});

app.get("/image", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalItems = await imageModel.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const items = await imageModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.put("/updateImage", async (req, res) => {
  const imageName = req.body.imageName;
  const imageUrl = req.body.imageUrl;
  const imageId = req.body.imageId;

  const newImageData = {
    imageName: imageName,
    imageUrl: imageUrl,
  };

  try {
    await imageModel.findByIdAndUpdate({ _id: imageId }, newImageData, {
      new: true,
    });

    res.send({
      success: true,
      message: "Updated",
    });
  } catch (error) {
    console.log(error);
  }

  console.log(imageName);
  console.log(imageUrl);
});

app.post("/image2", async (req) => {
  const imageName = req.body.imageName;
  const imageUrl = req.body.imageUrl;

  const parsedImgName = JSON.parse(imageName);
  const onlyImageName = parsedImgName.split(".")[0];
  const parsedUrl = JSON.parse(imageUrl);

  await imageModel2.create({
    imageName: onlyImageName,
    imageUrl: parsedUrl,
  });
});

app.post("/image3", async (req) => {
  const imageName = req.body.imageName;
  const imageUrl = req.body.imageUrl;

  const parsedImgName = JSON.parse(imageName);
  const onlyImageName = parsedImgName.split(".")[0];
  const parsedUrl = JSON.parse(imageUrl);

  await imageModel3.create({
    imageName: onlyImageName,
    imageUrl: parsedUrl,
  });
});

app.post("/order", async (req, res) => {
  const customerName = req.body.customerName;
  const customerEmail = req.body.customerEmail;
  const customerContact = req.body.customerContact;
  const productId = req.body.productId;
  const productQuantity = req.body.productQuantity;
  const productName = req.body.productName;
  const trackingId = req.body.trackingId;

  const mailOptions = {
    from: "aimaldeveloper@gmail.com",
    to: `${customerEmail}`,
    subject: "Tracking Id",
    html: `
    <p>Your Product Name is <b>${productName.toUpperCase()}</b></p>
    <p>Your Tracking Id is <b>${trackingId}</b></p>
    `,
  };

  try {
    await orderModel.create({
      trackingId: trackingId,
      productId: productId,
      productName: productName,
      productQuantity: productQuantity,
      customerName: customerName,
      customerEmail: customerEmail,
      customerContact: customerContact,
      orderStatus: "Pending",
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });

    res.send({
      success: true,
      message: "Order Placed",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error,
    });
  }
});

app.post("/orderStatus", async (req, res) => {
  const trackingId = req.body.trackingId;
  try {
    const orderStatus = await orderModel.findOne({ trackingId: trackingId });

    res.send({
      data: orderStatus,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/order", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of items per page

    const totalItems = await orderModel.countDocuments(); // Total number of items
    const totalPages = Math.ceil(totalItems / limit); // Total number of pages

    const items = await orderModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.put("/order", async (req, res) => {
  const orderId = req.body.orderId;
  const newOrderStatus = req.body.orderStatus;

  try {
    const order = await orderModel.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        orderStatus: newOrderStatus,
      },
      {
        new: true,
      }
    );

    res.send({
      success: true,
      message: "Order Status Updated",
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/message", async (req, res) => {
  const senderName = req.body.senderName;
  const senderEmail = req.body.senderEmail;
  const senderMessage = req.body.senderMessage;

  try {
    await messageModel.create({
      senderName: senderName,
      senderEmail: senderEmail,
      senderMessage: senderMessage,
    });

    res.send({
      messageSubmitText:
        "Your message is received and we will reply you on your email address soon.",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/message", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalItems = await messageModel.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const items = await messageModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post("/reply", async (req, res) => {
  const reply = req.body.reply;
  const senderEmail = req.body.senderEmail;

  const mailOptions = {
    from: "aimaldeveloper@gmail.com",
    to: `${senderEmail}`,
    subject: "Reply Message",
    text: `${reply}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send({
        success: false,
        message: "Reply Not Sent",
      });
    } else {
      res.send({
        success: true,
        message: "Reply Sent",
      });
    }
  });
});

app.post("/users", async (req, res) => {
  const userName = req.body.userName;
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;
  const userContact = req.body.userContact;

  const user = await userModel.findOne({ userName: userName });

  if (user) {
    res.send({
      success: false,
      message: "User Already Exists",
    });
    return;
  }

  try {
    const hashedPassword = await argon2.hash(userPassword);

    await userModel.create({
      userName: userName,
      userEmail: userEmail,
      hashedPassword: hashedPassword,
      userContact: userContact,
    });

    res.send({
      success: true,
      message: "Registration Successful",
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalItems = await userModel.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const items = await userModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post("/login", async (req, res) => {
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;

  try {
    const user = await userModel.findOne({
      userEmail: userEmail,
    });

    if (!user) {
      return res.send({
        success: false,
        message: "Wrong Email",
      });
    }

    const hashedPassword = user?.hashedPassword;

    const verifyPassword = await argon2.verify(hashedPassword, userPassword);

    if (!verifyPassword) {
      return res.send({
        success: false,
        message: "Wrong Password",
      });
    }

    if (user && verifyPassword) {
      return res.send({
        success: true,
        message: "Login Successful",
      });
    }
  } catch (error) {
    console.log(error);
  }
});
