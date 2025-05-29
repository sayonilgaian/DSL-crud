const express = require('express');
const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const {
	updateDSLClassName,
	addDSLAttribute,
	updateDSLAttribute,
} = require('../../utils/DSL/updateClassAttributes');
const getDomainFilePath = require('../../utils/DSL/getDomainFilePath');

const dslUpdateRouter = express.Router();
const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

const DOMAINS_DIR = path.join(__dirname, '../../files/domains');

dslUpdateRouter.put('/api/domain/:domain/update-class-name', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const { oldClassName, newClassName } = req.body;

	if (!newClassName) {
		return res.status(400).json({ error: 'newClassName is required.' });
	}

	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL does not exist.' });
	}

	return updateDSLClassName(
		res,
		parser,
		builder,
		domainFilePath,
		oldClassName,
		newClassName
	);
});

dslUpdateRouter.post('/api/domain/:domain/add-attribute', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const { className, attribute } = req.body;

	if (!attribute || !attribute.name || !attribute.type) {
		return res
			.status(400)
			.json({ error: 'attribute with name and type is required.' });
	}

	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL does not exist.' });
	}

	return addDSLAttribute(
		res,
		parser,
		builder,
		domainFilePath,
		className,
		attribute
	);
});

dslUpdateRouter.put('/api/domain/:domain/update-attribute', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const { className, attributeName, newAttribute } = req.body;

	if (!newAttribute || !newAttribute.name || !newAttribute.type) {
		return res
			.status(400)
			.json({ error: 'newAttribute with name and type is required.' });
	}

	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL does not exist.' });
	}

	return updateDSLAttribute(
		res,
		parser,
		builder,
		domainFilePath,
		className,
		attributeName,
		newAttribute
	);
});

module.exports = dslUpdateRouter;
