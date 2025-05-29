const fs = require('fs');
const etypes = require('../../data/types.json');

function addDSLClass(res, parser, builder,domainFilePath, classType, className, attributes) {
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
}

module.exports = addDSLClass;
