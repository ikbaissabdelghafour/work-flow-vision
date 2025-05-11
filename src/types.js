
// This file replaces the types.ts file
// It contains JSDoc comments to provide type information for editors that support it

/**
 * @typedef {'admin' | 'employee'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {string} [avatar]
 */

/**
 * @typedef {'todo' | 'in-progress' | 'done'} TaskStatus
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {TaskStatus} status
 * @property {string} projectId
 * @property {string[]} assignedEmployees
 * @property {string} createdAt
 * @property {number} [daysSpent]
 */

/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} teamId
 * @property {string} [taskId]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} teamId
 * @property {string[]} tasks - Task IDs
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string[]} employeeIds
 */

/**
 * @typedef {Object} AppState
 * @property {User|null} currentUser
 * @property {Project[]} projects
 * @property {Task[]} tasks
 * @property {Employee[]} employees
 * @property {Team[]} teams
 */

// Export only for documentation purposes, not actually used in JS
export const Types = {};
