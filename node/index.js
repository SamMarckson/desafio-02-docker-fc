const express = require('express');
const axios = require('axios').default;
const mysql = require('mysql');

const app = express();
const PORT = 3000;

const dbConfig = {
  host: 'db',
  user: 'root',
  password: 'password',
  database: 'nodedb',
};

async function getName() {
  const random = Math.floor(Math.random() * 10);
  const response = await axios.get('https://swapi.dev/api/people');
  return response.data.results[random].name;
}

function getPeople(res, connection) {
  const SELECT_QUERY = `SELECT id, name FROM people`;

  connection.query(SELECT_QUERY, (error, results) => {
    if (error) {
      res.status(500).send('Error getting people');
      return;
    }

    const tableRows = results
      .map(
        (person) => `
        <tr>
          <td>${person.id}</td>
          <td>${person.name}</td>
        </tr>
      `
      )
      .join('');
    const table = `
      <table>
        <tr>
          <th>#</th>
          <th>Name</th>
        </tr>${tableRows}
      </table>`;

    res.send(`
      <h1>Full Cycle Rocks!</h1>
      ${table}
    `);

    connection.end();
  });
}

async function InsertName(res) {
  const name = await getName();
  const connection = mysql.createConnection(dbConfig);
  const INSERT_QUERY = `INSERT INTO people(name) values('${name}')`;

  connection.query(INSERT_QUERY, (error, _results, _fields) => {
    if (error) {
      res.status(500).send('Error inserting name');
      return;
    }

    getPeople(res, connection);
  });
}

app.get('/', (_req, res) => {
  InsertName(res);
});

app.listen(PORT, () => {
  console.log(`Server up and running on port:${PORT}`);
});