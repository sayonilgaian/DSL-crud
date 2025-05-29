const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const getDomainFilePath = require('../../utils/DSL/getDomainFilePath');
const {
	deleteDSLAttribute,
	deleteDSLClass,
} = require('../../utils/DSL/deleteClassAttributes');

// Create router
const dslDeleteRouter = Router();

const DOMAINS_DIR = path.join(__dirname, '../../files/domains');

// Instantiate XML parsers
const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

// Ensure domains directory exists
if (!fs.existsSync(DOMAINS_DIR)) {
	fs.mkdirSync(DOMAINS_DIR);
}

dslDeleteRouter.delete('/api/domain/:domain/class/:className', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const className = req.params.className.toLowerCase();
	const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL does not exist.' });
	}

	return deleteDSLClass(res, parser, builder, domainFilePath, className);
});

dslDeleteRouter.delete(
	'/api/domain/:domain/delete-attribute',
	(req, res) => {
		const domain = req.params.domain.toLowerCase();
		const { className, attributeName } = req.body;
		const domainFilePath = getDomainFilePath(domain, DOMAINS_DIR);

		if (!fs.existsSync(domainFilePath)) {
			return res.status(404).json({ error: 'Domain DSL does not exist.' });
		}

		return deleteDSLAttribute(
			res,
			parser,
			builder,
			domainFilePath,
			className,
			attributeName
		);
	}
);

module.exports = dslDeleteRouter;
