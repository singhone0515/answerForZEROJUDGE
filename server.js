import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/api-data", (req, res) => {
  res.json({
    message: "Here is some sample API data",
    items: ["apple", "banana", "cherry"],
  });
});

let collectionType = null;
let collectionProb = null;

async function loadData() {
  collectionType = await db.collection("categoryTable").get();
  collectionProb = await db.collection("problems").get();
}

await loadData();

setInterval(
  async () => {
    console.log("⏳ 重新載入 Firestore 資料中...");
    await loadData();
    console.log("✅ Firestore 資料已更新");
  },
  2 * 60 * 60 * 1000,
);

app.get("/api/categories", async (req, res) => {
  try {
    let categories = [];

    collectionType.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: data.id,
        category: data.category.trim(),
      });
    });

    let flag = 1;
    collectionProb.forEach((doc) => {
      const data = doc.data();
      const cat = data.category;

      cat.forEach((cate) => {
        if (!categories.find((item) => item.category === cate)) {
          console.log("NO", cate);
          flag = 0;
        }
      });
    });
    if (flag) {
      console.log("All OK");
    }

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Server error" });
  }
});

app.post("/api/result", (req, res) => {
  try {
    let results = [];
    let searchRules = req.body;

    searchRules.forEach((item) => {
      collectionProb.forEach((doc) => {
        const data = doc.data();
        let flag = 1;

        if (item.id !== "") {
          if (item.id === "ALL") {
            results.push({
              id: data.id,
              name: data.title,
              difficulty: data.difficulty,
              category: data.category,
            });

            return;
          }
        }

        if (item.id !== "") {
          const dataLetter = data.id[0].toLowerCase();
          const dataNumber = Number(data.id.slice(1));
          const itemLetter = item.id[0].toLowerCase();
          const itemNumber = Number(item.id.slice(1));

          if (dataLetter !== itemLetter || dataNumber !== itemNumber) {
            flag = 0;
          }
        }

        if (item.name !== "") {
          if (!data.title.includes(item.name)) flag = 0;
        }

        if (item.difficulty !== -1) {
          if (data.difficulty !== item.difficulty) flag = 0;
        }

        const itemcate = JSON.parse(item.category);
        if (itemcate.length !== 0) {
          if (!itemcate.every((c) => data.category.includes(c))) flag = 0;
        }

        if (flag) {
          const exists = results.some((item) => item.id === data.id);
          if (!exists) {
            results.push({
              id: data.id,
              name: data.title,
              difficulty: data.difficulty,
              category: JSON.stringify(data.category),
            });
          }
        }
      });
    });
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "search error" });
  }
});

app.post("/api/detail", (req, res) => {
  try {
    const id = req.body.id;
    let detail = null;

    collectionProb.forEach((item) => {
      const data = item.data();
      if (data.id === id) detail = data;
    });

    res.json(detail);
  } catch (err) {
    console.log(err);
    res.status(600).json({ error: "detail search error" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});