const express = require('express');
const dslCreateRouter = require('./routers/DSL/create');
const dslDeleteRouter = require('./routers/DSL/delete');
const dslUpdateRouter = require('./routers/DSL/update');

const app = express();
app.use(express.json());
app.use(dslCreateRouter);
app.use(dslDeleteRouter);
app.use(dslUpdateRouter);

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
	console.log(`Ecore DSL service running on port ${PORT}`);
});
