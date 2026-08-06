const express = require('express');
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(__dirname, { extensions: ['html'], index: 'index.html' }));
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`NexaTrade starter listening on ${port}`));
