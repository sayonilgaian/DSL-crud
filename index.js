const express = require('express');
const dslRouter = require('./routers/DSL/dslRouter');

const app = express();
app.use(express.json());
app.use(dslRouter);

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
	console.log(`Ecore DSL service running on port ${PORT}`);
});
