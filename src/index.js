const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));


const $rdf = require('rdflib');

app.get('/api/rdf', async (req, res) => {
  const store = $rdf.graph();
  const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

  const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 }
  ];

  people.forEach(person => {
    const personNode = $rdf.sym(`http://example.org/person/${person.name}`);
    store.add(personNode, FOAF('name'), person.name);
    store.add(personNode, FOAF('age'), person.age.toString());
  });

  const mimeType = 'text/turtle';
  $rdf.serialize(undefined, store, 'http://example.org/', mimeType, (err, str) => {
    if (err) {
      res.status(500).send('Serialization error');
    } else {
      res.type(mimeType).send(str);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
