/**
 * server.js
 *
 * Node.js + Express server that:
 *  - Serves static files (index.html, movie.html, css, js).
 *  - Connects to MongoDB (RIONETWORKS.Telegram_files).
 *  - Provides /download?objectId=... to fetch a file from Telegram and stream it.
 */

const express = require('express');
const path = require('path');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

// 1) Telegram Bot Token - fill in your real token
const BOT_TOKEN = '1234567890:YOUR_BOT_TOKEN_HERE';

// 2) MongoDB connection
const MONGO_URI = 'mongodb+srv://Selfmixbot:nehalsingh969797@cluster0.kb5xjos.mongodb.net/?retryWrites=true&w=majority';

// DB + Collection names
const DB_NAME = 'RIONETWORKS';
const COLLECTION_NAME = 'Telegram_files';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all files in this folder statically
app.use(express.static(path.join(__dirname)));

/**
 * GET /download?objectId=someMongoObjectId
 *  - Finds doc in RIONETWORKS.Telegram_files by _id
 *  - doc.file_ref => Telegram file_id
 *  - Telegram getFile => file_path => stream to user
 */
app.get('/download', async (req, res) => {
  const objectIdStr = req.query.objectId;
  if (!objectIdStr) {
    return res.status(400).send('No objectId provided');
  }

  let client;
  try {
    // 1) Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // 2) Find the document by _id
    const doc = await collection.findOne({ _id: new ObjectId(objectIdStr) });
    if (!doc) {
      return res.status(404).send('Document not found in Telegram_files');
    }

    // doc.file_ref is presumably the Telegram file_id
    const fileId = doc.file_ref;
    if (!fileId) {
      return res.status(404).send('file_ref not found in document');
    }

    // 3) Telegram getFile => get file_path
    const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    const fileInfoRes = await axios.get(getFileUrl);
    if (!fileInfoRes.data.ok) {
      console.error('getFile error:', fileInfoRes.data);
      return res.status(500).send('Telegram getFile failed');
    }
    const filePath = fileInfoRes.data.result.file_path; // e.g. "documents/file_10"

    // 4) Download from Telegram's CDN
    const fileDownloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const fileStreamRes = await axios({
      url: fileDownloadUrl,
      method: 'GET',
      responseType: 'stream'
    });

    // Use doc.file_name if available for the downloaded filename
    const filename = doc.file_name ? doc.file_name : `downloaded_file`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe data to the response => user sees a normal download
    fileStreamRes.data.pipe(res);

  } catch (error) {
    console.error('Error in /download route:', error);
    res.status(500).send('Error downloading file');
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
