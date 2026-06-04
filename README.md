# Future Finance AI

Future Finance AI is a premium, dark-mode first personal wealth ecosystem and AI-powered financial advisor. Inspired by high-end fintech platforms like Apple, Stripe, and Linear, it features a glassmorphic dashboard, interactive 3D particle holograms, savings goals forecasts, budget analyzers, and automated PDF monthly report exports.

---

## 🚀 Key Features

*   **3D Hologram Assistant:** Slow-orbiting particle canvas and rotating glass torus built using Three.js and React Three Fiber.
*   **AI Financial Advisor Chatbot:** Metallic-glass chat interface containing a breathing 3D wireframe hologram assistant that supports contextual history memory.
*   **Financial Health Gauge:** Custom count-up radial gauge that rates your savings, debt ratio, and spending trends from 0 to 100.
*   **Intelligent Goal Forecasts:** Mapped active progress rings showing remaining target amounts and months required to hit goals.
*   **AI Budget Analyzer:** Allocation card that audits your monthly expenditures against the standard 50/30/20 budget framework.
*   **Expense Tracking:** Daily expense logs mapped under visual categories to flag lifestyle leaks instantly.
*   **PDF Exporter:** Dynamic monthly report compiler mapping account balances, category breakdowns, and AI feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React (Vite + TypeScript), Tailwind CSS, Framer Motion, Recharts, Three.js, `@react-three/fiber`, `@react-three/drei` |
| **Backend** | Node.js, Express, Mongoose, JWT Authentication, PDFKit |
| **Database** | MongoDB Atlas |
| **AI Layer** | Gemini API, OpenAI API, n8n Agent Webhooks (with local rules-engine fallback) |

---

## 📦 Project Structure

```text
future-finance-ai/
├── frontend/               # React + TypeScript client code
│   ├── src/
│   │   ├── components/     # UI components (3D elements, charts, sidebar)
│   │   ├── pages/          # Page layouts (Dashboard, Goals, Advisor)
│   │   ├── services/       # Frontend API endpoints communication
│   │   └── index.css       # Core theme styling (gradients, animations)
│   └── package.json
└── backend/                # Node.js + Express API server
    ├── src/
    │   ├── controllers/    # API controllers
    │   ├── models/         # MongoDB schemas (User, Expense, Goal)
    │   ├── services/       # Mongoose queries and AI context aggregation
    │   └── server.js       # Main server entry file
    └── package.json
```

---

## ⚙️ Environment Configurations

Create environment configuration files for both services. **Never commit these files containing real keys to version control.**

### 1. Backend Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_secure_random_jwt_secret_key
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/future-finance-ai?retryWrites=true&w=majority

# AI Engine Connections (Define at least one for chatbot support)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/financial-advisor
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Frontend Configuration
Create a `.env.production` file in the `frontend/` directory (for production builds):

```env
VITE_API_URL=https://your-deployed-backend-api.com/api
```

---

## 💻 Local Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas account or local MongoDB instance

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/future-finance-ai.git
    cd future-finance-ai
    ```

2.  **Start Backend Server:**
    ```bash
    cd backend
    npm install
    # Set your .env parameters
    npm run dev
    ```

3.  **Start Frontend Client:**
    ```bash
    cd ../frontend
    npm install
    # Dev server starts on http://localhost:5173
    npm run dev
    ```

---

## 🚢 Production Deployment

### Frontend (Static Hosting - Vercel / Netlify)
1.  Connect your GitHub repository to your hosting dashboard.
2.  Set the **Root Directory** to `frontend/`.
3.  Set the **Build Command** to `npm run build`.
4.  Set the **Output Directory** to `dist`.
5.  Expose the `VITE_API_URL` environment variable pointing to your deployed backend API server.

### Backend (Web Service - Render / Railway)
1.  Connect your GitHub repository to your hosting dashboard.
2.  Set the **Root Directory** to `backend/`.
3.  Set the **Build Command** to `npm install`.
4.  Set the **Start Command** to `npm start`.
5.  Set your env config keys (`MONGO_URI`, `JWT_SECRET`, `N8N_WEBHOOK_URL`) inside the hosting provider's dashboard settings.

---

## 📡 API Reference

All requests require a `Bearer <JWT_TOKEN>` in the `Authorization` header except for public authentication routes.

### Public Routes
*   `POST /api/auth/register` - Create a new user account.
*   `POST /api/auth/login` - Authenticate a user and receive a JWT token.
*   `GET /api/health` - Check backend service and routing health.

### Protected Routes (Requires Auth)
*   `GET /api/dashboard` - Get consolidated accounts overview, net worth, expenses, and savings goal metrics.
*   `GET /api/expenses` - Retrieve all category-mapped expenditures for the user.
*   `POST /api/expenses` - Add a new itemized expenditure.
*   `DELETE /api/expenses/:id` - Delete an itemized expenditure.
*   `GET /api/goals` - Fetch all savings goals and target dates.
*   `POST /api/goals` - Create a new savings target with optional monthly contribution planning.
*   `PUT /api/goals/:id` - Contribute a custom amount towards a specific savings goal.
*   `DELETE /api/goals/:id` - Delete a savings goal.
*   `GET /api/reports/monthly` - Download a compiled PDF performance report.

---

## 🔧 Troubleshooting

### "Failed to load goals" / Stale Session Warning
If the backend database server is restarted or the database collection is updated, the JWT token cached in your browser's local storage may become invalid.
*   **Fix:** Click the **Log Out** button at the bottom-left of the sidebar, register a fresh account or log back in, and the dashboard metrics will reload immediately.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
