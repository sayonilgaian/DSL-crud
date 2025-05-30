const fs = require('fs');

function addDSLReference(
	res,
	parser,
	builder,
	domainFilePath,
	fromClass,
	toClass,
	referenceName
) {
	const xmlData = fs.readFileSync(domainFilePath, 'utf-8');
	const jsonObj = parser.parse(xmlData);

	const ePackage = jsonObj['ecore:EPackage'];
	const eClassifiers = ePackage['eClassifiers'] || [];

	const fromClassDef = eClassifiers.find(
		(c) => c['@_name']?.toLowerCase() === fromClass.toLowerCase()
	);
	const toClassDef = eClassifiers.find(
		(c) => c['@_name']?.toLowerCase() === toClass.toLowerCase()
	);

	if (!fromClassDef || !toClassDef) {
		const classSummaries = eClassifiers.map((cls) => ({
			name: cls['@_name'],
			attributes: (cls.eStructuralFeatures || [])
				.filter((f) => f['@_xsi:type'] === 'ecore:EAttribute')
				.map((attr) => ({ name: attr['@_name'], type: attr['@_eType'] })),
		}));
		return res.status(404).json({
			error: 'One or both classes not found.',
			availableClasses: classSummaries,
		});
	}

	// Check if reference already exists
	const existingRef = (fromClassDef.eStructuralFeatures || []).find(
		(f) => f['@_name'] === referenceName
	);
	if (existingRef) {
		return res
			.status(409)
			.json({
				error: `Reference '${referenceName}' already exists in class '${fromClass}'.`,
			});
	}

	// Add the reference
	const referenceFeature = {
		'@_xsi:type': 'ecore:EReference',
		'@_name': referenceName,
		'@_eType': `#//${toClass}`,
	};

	if (!fromClassDef.eStructuralFeatures) {
		fromClassDef.eStructuralFeatures = [];
	}
	fromClassDef.eStructuralFeatures.push(referenceFeature);

	// Write back to XML
	const updatedXml = builder.build(jsonObj);
	fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

	return res.status(201).json({
		message: `Reference '${referenceName}' from '${fromClass}' to '${toClass}' added successfully.`,
	});
}

module.exports = addDSLReference
