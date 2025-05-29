const express = require('express');
const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const etypes = require('./data/types.json');

const app = express();
app.use(express.json());

const BASE_DSL_PATH = path.join(__dirname, './files/base.dsl.xml');
const DOMAINS_DIR = path.join(__dirname, './files/domains');

const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

// Ensure domains directory exists
if (!fs.existsSync(DOMAINS_DIR)) {
	fs.mkdirSync(DOMAINS_DIR);
}

// Utility function to get domain file path
const getDomainFilePath = (domain) =>
	path.join(DOMAINS_DIR, `${domain.toLowerCase()}.dsl.xml`);

// API to initialize domain DSL file
app.post('/api/domain/init', (req, res) => {
	const { domain } = req.body;
	if (!domain) return res.status(400).json({ error: 'Domain is required.' });

	const domainFilePath = getDomainFilePath(domain);

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
app.post('/api/domain/:domain/add-class', (req, res) => {
	const domain = req.params.domain.toLowerCase();
	const { classType, className, attributes } = req.body;

	if (!classType || !className || !attributes) {
		return res
			.status(400)
			.json({ error: 'classType, className, and attributes are required.' });
	}

	const domainFilePath = getDomainFilePath(domain);

	if (!fs.existsSync(domainFilePath)) {
		return res.status(404).json({ error: 'Domain DSL does not exist.' });
	}

	// Read and parse the existing domain DSL XML
	const xmlData = fs.readFileSync(domainFilePath, 'utf-8');
	const jsonObj = parser.parse(xmlData);

	const ePackage = jsonObj['ecore:EPackage'];
	const eClassifiers = ePackage['eClassifiers'] || [];

	// Check if class already exists
	const classExists = eClassifiers.some(
		(cls) => cls['@_name']?.toLowerCase() === className.toLowerCase()
	);
	if (classExists) {
		return res
			.status(200)
			.json({ message: `${className} already exists in the domain DSL.` });
	}

	// Create new class object
	const newClass = {
		'@_xsi:type': 'ecore:EClass',
		'@_name': className,
		eStructuralFeatures: attributes.map((attr) => ({
			'@_xsi:type': 'ecore:EAttribute',
			'@_name': attr.name,
			'@_eType': `http://www.eclipse.org/emf/2002/Ecore#//E${
				etypes[attr.type]
			}`,
		})),
	};

	// Add superclass if applicable
	const superClassMap = {
		actor: 'Actor',
		resource: 'Resource',
		condition: 'Condition',
		action: 'Action',
		entity: 'Entity',
	};

	const superClass = superClassMap[classType.toLowerCase()];
	if (superClass) {
		newClass['eSuperTypes'] = { '@_href': `#//${superClass}` };
	}

	// Append the new class to eClassifiers
	eClassifiers.push(newClass);
	ePackage['eClassifiers'] = eClassifiers;

	// Convert back to XML
	const updatedXml = builder.build(jsonObj);

	// Write back to the domain DSL file
	fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

	return res
		.status(201)
		.json({ message: `${className} added to the domain DSL.` });
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
	console.log(`Ecore DSL service running on port ${PORT}`);
});
