# Koaok

koa app extend.  
对 koa 进行改造和封装

# Installation
`npm install koaok`

# Usage
```javascript
const App = require('koaok');

const app = new App();

const router = new App.Router();

router.get('/',
  (ctx) => {
    return { num: 100 };
  },

  async ({ key }) => {
    // await xxx
    if (key !== 100) {
      throw new App.Error('key should be 100', 500);
    }

    return { state: 'ok' };
  },
);


app.root.get('/', ctx=>{status:'ok'});
app.root.subRouter('/v1', router);

app.listen(3000);
```
