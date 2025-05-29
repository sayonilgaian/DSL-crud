const path = require('path');

// Utility function to get domain file path
const getDomainFilePath = (domain, DOMAINS_DIR) =>
	path.join(DOMAINS_DIR, `${domain.toLowerCase()}.dsl.xml`);

module.exports = getDomainFilePath