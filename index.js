require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const nodeoutlook = require("nodejs-nodemailer-outlook");

// API Config
const app = express();
const port = process.env.PORT || 8800;

// Middlewares
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL })); 

// API routes
app.get("/", (req, res) => res.status(200).send("The Coffee House Server"));
app.post("/payments/userEmail", async (req, res) => {
  const userEmail = req.query.email;

  nodeoutlook.sendEmail({
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.AUTH_EMAIL,
    to: userEmail,
    subject: "The Coffee House: Your Order",
    html: "<h4>Greetngs Dear Customer,</h4><p>This is an email to confirm your order with us at The Coffee House. Your order_id is w9z_093js4_TCH and your tracking number is 4356. Your order will be delivered within 5 business days, if not contact: +(27) 13 213 4567.</p><p>For more details see the statement attcahed.</p><h4>Kind Regards,<h4>The Coffee House</h3>",
    attachments: [
      {
        filename: 'Order_info.txt',
        content : 'This is your order info...'
      }
    ],
    onError : (e) => console.log(e),
    onSuccess: (i) => console.log(i)
  });
});

app.post("/payments/create", async (req, res) => {
  const total = req.query.total;

  console.log("Payment request recieved for: ", total);

  const paymentIntent = await stripe.paymentIntents
    .create({
      amount: total,
      currency: "usd",
    })
    .catch((err) => console.log(err.message));

  if (paymentIntent) {
    res.status(201).send({
      clientSecret: paymentIntent.client_secret,
    });

  } else {
    res.status(400).send("An Error Occured");
  }
});

app.listen(port, err => {
  if(err) throw err;
  console.log("%c Server running", "color: green",`listening on port ${port}...`);
});
