/**
 * Utility functions for navigation management
 */

/**
 * Cleans up saved pagination states
 * @param {string} exceptPage - Optional page name to preserve pagination state
 */
export function cleanupPaginationState(exceptPage = null) {
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Find keys related to pagination
  const paginationKeys = keys.filter(key => key.includes('_perPage'));
  
  // Remove all pagination states except for the specified page
  paginationKeys.forEach(key => {
    if (!exceptPage || !key.includes(exceptPage)) {
      localStorage.removeItem(key);
    }
  });
}

export default {
  cleanupPaginationState
};
