# CaptionAI

CaptionAI is a modern, full-stack AI image captioning application. Users upload an image, the client forwards it to a secure backend REST API route, and the backend delegates inference to a hosted vision-language model via Hugging Face. Every generated caption is automatically archived in a MongoDB database and rendered dynamically in a real-time history activity log.

Built from scratch using **JavaScript (ES6)** and React **JSX**.

---

## 🌟 Key Features

*   **AI Caption Generation:** Integrates with Hugging Face vision-language models (`CohereLabs/aya-vision-32b` or equivalent) via OpenAI-compatible chat completion endpoints.
*   **Database Archiving:** Automatically saves successful captions alongside image metadata (filename, file size, insertion timestamp) in MongoDB.
*   **Full REST APIs:** Independent backend routing for captioning and loading recent history.
*   **Production UI:** Sleek, responsive, dark glassmorphism layout with smooth copy-to-clipboard interactions.
*   **Containerized Architecture:** Fully structured with custom `Dockerfile` and `docker-compose.yml` for multi-container coordination.

---

## 💻 Tech Stack

*   **Frontend:** React (JSX), Tailwind CSS, Lucide React Icons.
*   **Backend:** Next.js (App Router REST API Endpoints running Node.js).
*   **Database:** MongoDB.
*   **Inference:** Hugging Face Inference Providers.

---

## 🚀 Setup & Execution Guide

### Option 1: Standard Local Setup

#### Prerequisites
1. Install [Node.js (LTS version)](https://nodejs.org).
2. Ensure you have a running MongoDB instance locally (`mongodb://localhost:27017`) OR a cloud MongoDB Atlas connection string.

#### Steps
1. Navigate to the project root:
   ```powershell
   cd C:\Users\admin\CaptionAI
   ```
2. Install npm packages:
   ```powershell
   npm install
   ```
3. Setup environment variables:
   * Edit `.env.local` in the project root.
   * Add your Hugging Face API key and MongoDB URI:
     ```env
     HUGGINGFACE_API_KEY=your_huggingface_token_here
     MONGODB_URI=mongodb://localhost:27017/visioscribe
     ```
4. Build the application for production:
   ```powershell
   npm run build
   ```
5. Run the dev server:
   ```powershell
   npm run dev
   ```
6. Open: **`http://localhost:3000`** (or `http://localhost:3001` if port 3000 is occupied).

---

### Option 2: Docker Setup (Fast & Isolated)

This method spins up the Next.js web application and an isolated MongoDB database container automatically.

#### Prerequisites
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### Steps
1. Open your terminal in the project directory.
2. Run Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open your browser and navigate to: **`http://localhost:3000`**. The Next.js container automatically hooks into the database container.

---

## 🌐 API Documentation

All API routes are hosted under the `/api/*` prefix.

### 1. Generate Image Caption
Generates a one-sentence descriptive caption for an uploaded image.

*   **Endpoint:** `POST /api/caption`
*   **Content-Type:** `multipart/form-data`
*   **Request Payload (Body):**
    *   `image`: The raw binary image file (supported formats: JPG, PNG, WEBP).
*   **Expected Response (`200 OK`):**
    ```json
    {
      "caption": "A detailed descriptive sentence of the uploaded image contents."
    }
    ```
*   **Error Response (`400 Bad Request` or `502 Bad Gateway`):**
    ```json
    {
      "error": "No image file provided."
    }
    ```

### 2. Fetch Caption History
Retrieves the 10 most recent generated captions stored in the database.

*   **Endpoint:** `GET /api/history`
*   **Expected Response (`200 OK`):**
    ```json
    {
      "ok": true,
      "captions": [
        {
          "id": "645d8b724f8d2b3c10aef79b",
          "caption": "A brown dog running through green grass chasing a red ball.",
          "filename": "dog_running.png",
          "fileSize": 1048576,
          "createdAt": "2026-05-21T07:12:00.000Z"
        }
      ]
    }
    ```
*   **Error Response (`500 Internal Server Error`):**
    ```json
    {
      "ok": false,
      "error": "Failed to fetch caption history",
      "captions": []
    }
    ```

---

## 🗄️ Database Schema Details

CaptionAI stores documents inside the `captions` collection of the `visioscribe` MongoDB database. Each document structured as follows:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated MongoDB primary key. |
| `caption` | `String` | The generated descriptive text. |
| `filename` | `String` | The original file name uploaded by the user. |
| `fileSize` | `Number` | File size of the uploaded image in bytes. |
| `createdAt` | `Date` | The timestamp of generation (UTC). |

### Example Document:
```json
{
  "_id": {"$oid": "664c7ad3f9479b183617b401"},
  "caption": "A standard close up view of a glowing computer monitor showing terminal logs.",
  "filename": "screenshot_terminal.png",
  "fileSize": 245100,
  "createdAt": {"$date": "2026-05-21T07:15:30.000Z"}
}
```
