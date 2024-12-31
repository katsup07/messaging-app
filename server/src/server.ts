const express = require('express');
const json = require('body-parser');
const { setMessageRoutes } = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(json());
setMessageRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});