import express from 'express';
import fs from 'fs';
import path from 'path';
import { render } from '../main.server';

const app = express();

const clientDistPath = path.resolve(__dirname, '../client');

app.use(express.static(clientDistPath, { index: false }));

const template = fs.readFileSync(path.join(clientDistPath, 'index.html'), 'utf-8');
const [templateHead, templateTail] = template.split('<!--ssr-outlet-->');

app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(templateHead);

  const { pipe } = render(req.url, {
    onShellReady() {
      pipe(res);
    },
    onAllReady() {
      res.write(templateTail);
      res.end();
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
