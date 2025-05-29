const fs = require('fs');
const etypes = require('../../data/types.json');

function updateDSLClassName(
	res,
	parser,
	builder,
	domainFilePath,
	oldClassName,
	newClassName
) {
	const xmlData = fs.readFileSync(domainFilePath, 'utf-8');
	const jsonObj = parser.parse(xmlData);

	const ePackage = jsonObj['ecore:EPackage'];
	const eClassifiers = ePackage['eClassifiers'] || [];

	const targetClass = eClassifiers.find(
		(cls) => cls['@_name']?.toLowerCase() === oldClassName.toLowerCase()
	);

	if (!targetClass) {
		return res.status(404).json({ error: `Class ${oldClassName} not found.` });
	}

	targetClass['@_name'] = newClassName;
	const updatedXml = builder.build(jsonObj);
	fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

	return res
		.status(200)
		.json({
			message: `Class name updated from ${oldClassName} to ${newClassName}.`,
		});
}

function addDSLAttribute(
	res,
	parser,
	builder,
	domainFilePath,
	className,
	attribute
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

	const features = targetClass['eStructuralFeatures'] || [];
	const attributeExists = features.some(
		(attr) => attr['@_name']?.toLowerCase() === attribute.name.toLowerCase()
	);

	if (attributeExists) {
		return res
			.status(400)
			.json({
				error: `Attribute ${attribute.name} already exists in class ${className}.`,
			});
	}

	features.push({
		'@_xsi:type': 'ecore:EAttribute',
		'@_name': attribute.name,
		'@_eType': `http://www.eclipse.org/emf/2002/Ecore#//E${attribute.type}`,
	});

	targetClass['eStructuralFeatures'] = features;
	const updatedXml = builder.build(jsonObj);
	fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

	return res
		.status(201)
		.json({
			message: `Attribute ${attribute.name} added to class ${className}.`,
		});
}

function updateDSLAttribute(res, parser, builder, domainFilePath, className, attributeName, newAttribute) {
  try {
    // Read and parse the existing domain DSL XML
    const xmlData = fs.readFileSync(domainFilePath, 'utf-8');
    const jsonObj = parser.parse(xmlData);

    const ePackage = jsonObj['ecore:EPackage'];
    const eClassifiers = ePackage['eClassifiers'] || [];

    // Find the class to update
    const targetClass = eClassifiers.find(
      (cls) => cls['@_name']?.toLowerCase() === className.toLowerCase()
    );

    if (!targetClass) {
      return res.status(404).json({ error: `Class '${className}' not found.` });
    }

    const attributes = targetClass['eStructuralFeatures'] || [];

    // Find the attribute to update
    const targetAttribute = attributes.find(
      (attr) => attr['@_name']?.toLowerCase() === attributeName.toLowerCase()
    );

    if (!targetAttribute) {
      return res.status(404).json({ error: `Attribute '${attributeName}' not found in class '${className}'.` });
    }

    // Update attribute properties
    if (newAttribute.name) {
      targetAttribute['@_name'] = newAttribute.name;
    }

    if (newAttribute.type) {
      const ecoreType = etypes[newAttribute.type];
      if (!ecoreType) {
        return res.status(400).json({ error: `Unsupported attribute type '${newAttribute.type}'.` });
      }
      targetAttribute['@_eType'] = `http://www.eclipse.org/emf/2002/Ecore#//E${ecoreType}`;
    }

    // Convert back to XML
    const updatedXml = builder.build(jsonObj);

    // Write back to the domain DSL file
    fs.writeFileSync(domainFilePath, updatedXml, 'utf-8');

    return res.status(200).json({ message: `Attribute '${attributeName}' in class '${className}' updated successfully.` });
  } catch (error) {
    console.error('Error updating attribute:', error);
    return res.status(500).json({ error: 'An error occurred while updating the attribute.' });
  }
}

module.exports = updateDSLAttribute;


module.exports = { updateDSLClassName, addDSLAttribute, updateDSLAttribute };
