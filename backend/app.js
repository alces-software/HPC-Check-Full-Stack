const express = require('express');
const app = express();

app.use(express.json());

app.get('/status', (req, res) => {
   console.log(req);
   res.json({
      status: 'Running',
      timestamp: new Date().toUTCString()
   });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));