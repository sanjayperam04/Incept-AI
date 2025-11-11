/**
 * User Manager - Handles anonymous user identification
 * Generates and manages unique user IDs for data isolation
 */

const USER_ID_KEY = 'anonymous_user_id'

/**
 * Generate a unique user ID using crypto API
 * @returns {string} UUID in format: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 */
function generateUserId() {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Get the current user ID, or generate a new one if it doesn't exist
 * @returns {string} User ID
 */
export function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY)
  
  if (!userId) {
    userId = generateUserId()
    localStorage.setItem(USER_ID_KEY, userId)
    console.log('New anonymous user ID generated:', userId)
  }
  
  return userId
}

/**
 * Get a storage key prefixed with user ID
 * @param {string} key - The base key name
 * @returns {string} User-specific storage key
 */
export function getUserKey(key) {
  const userId = getUserId()
  return `user_${userId}_${key}`
}

/**
 * Get item from localStorage with user-specific key
 * @param {string} key - The base key name
 * @returns {string|null} Stored value or null
 */
export function getUserItem(key) {
  return localStorage.getItem(getUserKey(key))
}

/**
 * Set item in localStorage with user-specific key
 * @param {string} key - The base key name
 * @param {string} value - Value to store
 */
export function setUserItem(key, value) {
  localStorage.setItem(getUserKey(key), value)
}

/**
 * Remove item from localStorage with user-specific key
 * @param {string} key - The base key name
 */
export function removeUserItem(key) {
  localStorage.removeItem(getUserKey(key))
}

/**
 * Clear all data for the current user
 */
export function clearUserData() {
  const userId = getUserId()
  const keysToRemove = []
  
  // Find all keys belonging to this user
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(`user_${userId}_`)) {
      keysToRemove.push(key)
    }
  }
  
  // Remove all user-specific keys
  keysToRemove.forEach(key => localStorage.removeItem(key))
  
  console.log(`Cleared ${keysToRemove.length} items for user ${userId}`)
}

/**
 * Reset user ID and clear all data (creates new anonymous user)
 */
export function resetUser() {
  clearUserData()
  localStorage.removeItem(USER_ID_KEY)
  const newUserId = getUserId() // This will generate a new ID
  console.log('User reset. New ID:', newUserId)
  return newUserId
}

/**
 * Get current user ID without generating a new one
 * @returns {string|null} User ID or null if not set
 */
export function getCurrentUserId() {
  return localStorage.getItem(USER_ID_KEY)
}
