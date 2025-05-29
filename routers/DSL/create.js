const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const getDomainFilePath = require('../../utils/DSL/getDomainFilePath');
const addDSLClass = require('../../utils/DSL/addDSLClass');

// Create router
const dslCreateRouter = Router();

const BASE_DSL_PATH = path.join(__dirname, '../../files/base.dsl.xml');
const DOMAINS_DIR = path.join(__dirname, '../../files/domains');

// Instantiate XML parsers
const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

// Ensure domains directory exists
if (!fs.existsSync(DOMAINS_DIR)) {
	fs.mkdirSync(DOMAINS_DIR);
}

// API to initialize domain DSL file
dslCreateRouter.post('/api/domain/init', (req, res) => {
	const { domain } = req.body;
	if (!domain) return res.status(400).json({ error: 'Domain is required.' });

	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (fs.existsSync(domainFilePath)) {
		return res.status(200).json({ message: 'Domain DSL already exists.' });
	}

	fs.copyFile(BASE_DSL_PATH, domainFilePath, (err) => {
		if (err)
			return res.status(500).json({ error: 'Failed to create domain DSL.' });
		return res
			.status(201)
			.json({ message: 'Domain DSL created successfully.' });
	});
});

// API to add a new class (entity, actor, resource, etc.)
dslCreateRouter.post('/api/domain/:domain/add-class', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const { classType, className, attributes } = req.body;

	if (!classType || !className || !attributes) {
		return res
			.status(400)
			.json({ error: 'classType, className, and attributes are required.' });
	}

	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL does not exist.' });
	}

	return addDSLClass(
		res,
		parser,
		builder,
		domainFilePath,
		classType,
		className,
		attributes
	);
});

module.exports = dslCreateRouter;
