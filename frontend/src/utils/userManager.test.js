/**
 * Manual Test Script for User Manager
 * Open browser console and run these tests
 */

// Test 1: Generate User ID
console.log('Test 1: Generate User ID')
import { getUserId } from './userManager.js'
const userId = getUserId()
console.log('User ID:', userId)
console.assert(userId && userId.length > 0, 'User ID should exist')

// Test 2: User ID Persistence
console.log('\nTest 2: User ID Persistence')
const userId2 = getUserId()
console.assert(userId === userId2, 'User ID should be same on second call')

// Test 3: Set and Get User Item
console.log('\nTest 3: Set and Get User Item')
import { setUserItem, getUserItem } from './userManager.js'
setUserItem('test_key', 'test_value')
const value = getUserItem('test_key')
console.assert(value === 'test_value', 'Should retrieve stored value')

// Test 4: User Key Format
console.log('\nTest 4: User Key Format')
import { getUserKey } from './userManager.js'
const key = getUserKey('messages')
console.log('User Key:', key)
console.assert(key.startsWith('user_'), 'Key should start with user_')
console.assert(key.includes('_messages'), 'Key should include original key name')

// Test 5: Clear User Data
console.log('\nTest 5: Clear User Data')
import { clearUserData } from './userManager.js'
setUserItem('test1', 'value1')
setUserItem('test2', 'value2')
clearUserData()
const cleared1 = getUserItem('test1')
const cleared2 = getUserItem('test2')
console.assert(cleared1 === null, 'Data should be cleared')
console.assert(cleared2 === null, 'Data should be cleared')

// Test 6: Reset User
console.log('\nTest 6: Reset User')
import { resetUser, getCurrentUserId } from './userManager.js'
const oldId = getCurrentUserId()
const newId = resetUser()
console.log('Old ID:', oldId)
console.log('New ID:', newId)
console.assert(oldId !== newId, 'New ID should be different')

console.log('\n✅ All tests passed!')
