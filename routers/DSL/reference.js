const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const getDomainFilePath = require('../../utils/DSL/getDomainFilePath');
const addDSLReference = require('../../utils/DSL/addDSLReference');

// Create router
const dslReferenceRouter = Router();

const DOMAINS_DIR = path.join(__dirname, '../../files/domains');

// Instantiate XML parsers
const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

// Ensure domains directory exists
if (!fs.existsSync(DOMAINS_DIR)) {
	fs.mkdirSync(DOMAINS_DIR);
}


dslReferenceRouter.post('/api/domain/:domain/add-reference', (req, res) => {
  const domain = req.params.domain.toLowerCase();
  const { fromClass, toClass, referenceName } = req.body;

  if (!fromClass || !toClass || !referenceName) {
    return res.status(400).json({
      error: 'fromClass, toClass, and referenceName are required.'
    });
  }

  const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);
  if (!fs.existsSync(domainFilePath)) {
    return res.status(404).json({ error: 'Domain DSL does not exist.' });
  }

  return addDSLReference(
    res,
    parser,
    builder,
    domainFilePath,
    fromClass,
    toClass,
    referenceName
  );
});

module.exports = dslReferenceRouter
