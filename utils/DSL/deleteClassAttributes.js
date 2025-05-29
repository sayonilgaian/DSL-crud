const fs = require('fs');

function deleteDSLClass(res, parser, builder, domainFilePath, className) {
	const xmlData = fs.readFileSync(domainFilePath, 'utf-8');
	const jsonObj = parser.parse(xmlData);

	const ePackage = jsonObj['ecore:EPackage'];
	let eClassifiers = ePackage['eClassifiers'] || [];

	const initialLength = eClassifiers.length;
	eClassifiers = eClassifiers.filter(
		(cls) => cls['@_name']?.toLowerCase() !== className.toLowerCase()
	);

	if (eClassifiers.length === initialLength) {
		return res.status(404).json({ error: `Class ${className} not found.` });
	}

	ePackage['eClassifiers'] = eClassifiers;
	const updatedXml = builder.build(jsonObj);
	fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

	return res.status(200).json({ message: `Class ${className} deleted.` });
}

function deleteDSLAttribute(
	res,
	parser,
	builder,
	domainFilePath,
	className,
	attributeName
) {
	const xmlData = fs.readFileSync(domainFilePath, 'utf-8');
	const jsonObj = parser.parse(xmlData);

	const ePackage = jsonObj['ecore:EPackage'];
	const eClassifiers = ePackage['eClassifiers'] || [];

	const targetClass = eClassifiers.find(
		(cls) => cls['@_name']?.toLowerCase() === className.toLowerCase()
	);

	if (!targetClass) {
		return res.status(404).json({ error: `Class ${className} not found.` });
	}

	let features = targetClass['eStructuralFeatures'] || [];
	const initialLength = features.length;
	features = features.filter(
		(attr) => attr['@_name']?.toLowerCase() !== attributeName.toLowerCase()
	);

	if (features.length === initialLength) {
		return res
			.status(404)
			.json({
				error: `Attribute ${attributeName} not found in class ${className}.`,
			});
	}

	targetClass['eStructuralFeatures'] = features;
	const updatedXml = builder.build(jsonObj);
	fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

	return res
		.status(200)
		.json({
			message: `Attribute ${attributeName} deleted from class ${className}.`,
		});
}

module.exports = { deleteDSLClass, deleteDSLAttribute };
