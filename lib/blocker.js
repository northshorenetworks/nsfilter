import express from 'express';
import categorize, {ID_TO_NAMES} from './categorize';

let app = express();

app.use((req, res, next) => {
  categorize(req.headers.host, categories => {
    categories = categories.map(a => ID_TO_NAMES[a]).join(', ');   
    res.send(`<h1>Page Blocked</h1><strong>Reason:</strong> ${categories}`);
  });
});

export default app;