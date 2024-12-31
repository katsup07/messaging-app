const express = require('express');
const cors = require('cors');
const { setMessageRoutes } = require('./routes/messageRoutes');
const { setAuthRoutes } = require('./routes/authRoutes');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

setMessageRoutes(app);
setAuthRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});