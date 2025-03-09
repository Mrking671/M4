const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const MovieSchema = new mongoose.Schema({
  title: String,
  telegramFileId: String,
  downloadLink: String, // Optional: if direct links are available
});

const Movie = mongoose.model("Movie", MovieSchema);

// API: Get movie details
app.get("/api/movies/:title", async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title });
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// API: Handle download request
app.post("/api/download", async (req, res) => {
  const { title, userId } = req.body;

  try {
    const movie = await Movie.findOne({ title });
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    if (movie.downloadLink) {
      // Direct download method
      return res.json({ type: "direct", url: movie.downloadLink });
    } else if (movie.telegramFileId) {
      // Forward request to Telegram bot
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
        chat_id: userId,
        document: movie.telegramFileId,
      });

      return res.json({ type: "bot", message: "File will be sent via Telegram bot." });
    } else {
      return res.status(404).json({ error: "Download option not available" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
