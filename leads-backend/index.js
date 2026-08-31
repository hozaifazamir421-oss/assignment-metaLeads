require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }, 
});

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;


io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
});

app.get("/", (req,res)=>{
    res.send("default route")
})
app.get('/test-emit', (req, res) => {
  const fakeLead = {
    id: Date.now().toString(),
    name: 'Test Lead',
    email: 'test@example.com',
    phone: '9999999999',
  };
  io.emit('new_lead', fakeLead);
  res.send('Fake lead emitted!');
});

// 1. Handles Meta's verification handshake (GET request). required initially only when setting up the app
// we have to paste the backend url(ngrok) to the app to make this possible.
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed.');
    res.sendStatus(403);
  }
});


app.post('/webhook', async (req, res) => {
  console.log('Webhook event received:', JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];

    if (change?.field === 'leadgen') {
      const leadgenId = change.value.leadgen_id;
      console.log('New lead ID:', leadgenId);

      const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
      const graphUrl = `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${ACCESS_TOKEN}`;

      const response = await fetch(graphUrl);
      const leadData = await response.json();

      console.log('Full lead data:', leadData);

      const fields = {};
      leadData.field_data?.forEach((f) => {
        fields[f.name] = f.values[0];
      });

      const formattedLead = {
        id: leadgenId,
        name: fields.full_name || 'Unknown',
        email: fields.email || 'N/A',
        phone: fields.phone_number || 'N/A',
      };

      io.emit('new_lead', formattedLead);
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
  }

  res.sendStatus(200);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});