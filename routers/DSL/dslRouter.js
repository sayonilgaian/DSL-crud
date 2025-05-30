const { Router } = require('express');
const dslCreateRouter = require('./create');
const dslDeleteRouter = require('./delete');
const dslUpdateRouter = require('./update');
const dslReferenceRouter = require('./reference');
const convertRouter = require('./convert');

const dslRouter = Router();

dslRouter.use(dslCreateRouter);
dslRouter.use(dslDeleteRouter);
dslRouter.use(dslUpdateRouter);
dslRouter.use(dslReferenceRouter);
dslRouter.use(convertRouter);

module.exports = dslRouter
