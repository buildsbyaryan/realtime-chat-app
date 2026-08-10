# Real-Time Chat Application

A real-time chat application built using React Native, Expo, Node.js, Express, Socket.io and MongoDB.

## Features

- Real-time messaging
- Socket.io communication
- Chat history
- MongoDB message persistence
- Username-based login
- Online/offline status
- Online users list
- Typing indicator
- Message timestamps
- Sent status
- Delivered status
- Read status
- Duplicate message protection
- API error handling
- Loading state
- Empty state
- Reconnection handling
- Responsive mobile UI

## Tech Stack

### Frontend

- React Native
- Expo
- TypeScript
- Expo Router

### Backend

- Node.js
- Express.js
- Socket.io

### Database

- MongoDB
- Mongoose

## Project Structure

```text
realtime-chat-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   ├── package.json
│   └── app.json
│
└── README.md