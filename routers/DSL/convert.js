const express = require('express');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const yaml = require('js-yaml');
const getDomainFilePath = require('../../utils/DSL/getDomainFilePath');

const convertRouter = express.Router();

const DOMAINS_DIR = path.join(__dirname, '../../files/domains');

convertRouter.get('/api/domain/:domain/convert-to-yaml', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL XML file not found.' });
	}

	try {
		const xmlContent = fs.readFileSync(domainFilePath, 'utf-8');

		const parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: '@_',
			preserveOrder: false,
		});

		const jsonObj = parser.parse(xmlContent);
		const yamlContent = yaml.dump(jsonObj, { lineWidth: 120 });

		res.setHeader('Content-Type', 'text/yaml');
		return res.status(200).send(yamlContent);
	} catch (err) {
		console.error('YAML conversion failed:', err);
		return res.status(500).json({ error: 'Failed to convert XML to YAML.' });
	}
});

module.exports = convertRouter;
