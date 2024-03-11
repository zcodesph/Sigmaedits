const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

app.get('/sigmaedits', async (req, res) => {
  try {
    const edits = ["sigmaahustler","marvin.randomedit.com","bywalles"];
    const randomIndex = Math.floor(Math.random() * edits.length);
    const randomEdit = edits[randomIndex];
    const response = await axios.get(
      `https://oneapi1.replit.app/tiktok?search=${encodeURIComponent(randomEdit)}`,
      {
        timeout: 5000 // wait for 5 seconds max
      }
    );

    if (response.status !== 200) {
      throw new Error("Server responded with non-ok status");
    }

    const videos = response.data.data.videos;

    // Check for the 'videos' property
    if (!videos || videos.length === 0) {
      return res.status(404).send("No videos found.");
    }

    const randomVideoIndex = Math.floor(Math.random() * videos.length);
    const videoData = videos[randomVideoIndex];

    if (res.headersSent) {
      return;
    }

    const videoUrl = videoData.play;
    const videoResponse = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream',
      timeout: 5000
    });

    const filePath = path.join(__dirname, 'video');
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }
    const videoFilePath = path.join(filePath, 'girledit.mp4');
    const writer = fs.createWriteStream(videoFilePath);
    videoResponse.data.pipe(writer);

    writer.on('finish', () => {
      res.sendFile(videoFilePath, () => fs.unlinkSync(videoFilePath));
    });

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      res.status(500).send("Failed to retrieve, please try again later.");
    } else {
      console.error('Error:', error.message);
      res.status(500).send("An error occurred while processing the request.");
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
