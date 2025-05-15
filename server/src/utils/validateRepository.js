const logger = require('../middleware/logger');

// Validate that repositories implement their contracts
function validateRepository(repository, Contract, name) {
  // Get all method names from the contract prototype except constructor
  const contractMethods = Object.getOwnPropertyNames(Contract.prototype)
    .filter(method => method !== 'constructor');
  
  // Check each method exists in the repository
  for (const method of contractMethods){
    if (typeof repository[method] !== 'function') 
      throw new Error(`Repository ${name} does not implement required method: ${method}`);
    
  // Ensure method is not just the one from the base class and is overridden.
    if (repository[method].toString() === Contract.prototype[method].toString())
      throw new Error(`Repository ${name} has not properly implemented method: ${method} of the Base class contract`);
  }
  
  logger.logInfo(`✓ ${name} successfully validated against contract`);
  
  return repository;
}

module.exports = {
  validateRepository
};