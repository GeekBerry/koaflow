const superagent = require('superagent');

async function main() {
  let response;

  response = await superagent.post('http://127.0.0.1:3000/api').send({ name: 'Tom', age: 18 });
  console.log(response.status);
  console.log(JSON.stringify(response.body));

  response = await superagent.get('http://127.0.0.1:3000/api');
  console.log(response.status);
  console.log(JSON.stringify(response.body));

  response = await superagent.delete('http://127.0.0.1:3000/api/1');
  console.log(response.status);
  console.log(JSON.stringify(response.body));
}

main();
