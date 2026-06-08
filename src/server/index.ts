import express from 'express';
import { render } from '../main.server';
import path from 'path';

const app = express();

const clientDistPath = path.resolve(__dirname, '../client');

app.use('/assets', express.static(path.join(clientDistPath, 'assets')));

app.use('*', (req, res) => {
  const { pipe } = render(req.url, {
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    },
    onShellError() {
      res.status(500).send('Server error');
    },
    onError(error) {
      console.error(error);
    },
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
