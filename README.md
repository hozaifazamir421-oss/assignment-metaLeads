# Meta Lead Ads + React Native Real-Time PoC

This project connects Meta Lead Ads to a React Native mobile app in real time.
When someone submits a lead through Meta (or Meta's testing tool), it appears
instantly on an already-open phone screen — no manual refresh needed.

## How it works

1. A lead is submitted through Meta.
2. Meta sends a webhook (a notification) to our backend.
3. The backend fetches the full lead details from Meta's Graph API.
4. The backend sends the lead to the phone app using Socket.io (a real-time
   connection).
5. The phone app shows the new lead instantly.

## Project structure

- `leads-app/` — the React Native (Expo) frontend, runs on the phone.
- `leads-backend/` — the Express + Socket.io backend server.

## How to run this project

### 1. Backend setup
cd leads-backend
npm install

Create a file named `.env` inside `leads-backend` with this content:
VERIFY_TOKEN=your_verify_token_here
ACCESS_TOKEN=your_meta_page_access_token_here

Then start the backend:
node index.js

You should see: `Server running on http://localhost:3000`

### 2. Expose the backend to the internet (for Meta's webhook)
ngrok http 3000

Copy the ngrok URL it gives you and paste `<that-url>/webhook` into your Meta
App's Webhooks settings as the Callback URL.

### 3. Frontend setup
cd leads-app
npm install
npx expo start

Scan the QR code with the Expo Go app on your phone.

**Important:** open `leads-app`'s main screen file and update `SOCKET_URL` to
your PC's current local IP address (find it using `ipconfig` on Windows),
so the phone can reach your backend over the same Wi-Fi network.
