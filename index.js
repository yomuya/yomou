const express = require('express');
const app = express();
const port = 3000;


let greeting = "Hello from the backend!";
app.get('/', (req, res) => {
  res.send(`
    <h1 id="greeting">${greeting}</h1>
    <button onclick="changeGreeting()">Change Greeting</button>
    <script>
      function changeGreeting() {
        fetch('/set-greeting?text=Hello+from+the+button')
          .then(() => location.reload());
      }
    </script>
  `);
});

app.get('/set-greeting', (req, res) => {
  if (req.query.text) {
    greeting = req.query.text;
    res.send('Greeting updated!');
  } else {
    res.send('Please provide ?text=Your+Greeting');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
