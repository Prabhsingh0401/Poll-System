/**
 * Socket Handler - Manages socket connections and disconnections
 * Handles user roles and connection state
 */

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.userRoles = {};
    this.connectedUsers = { students: 0, teachers: 0 };
    this.studentNames = [];
  }

  /**
   * Handle user join event
   * @param {string} socketId - Socket ID
   * @param {Object} userData - { role, name }
   * @returns {Object} - User info
   */
  handleUserJoin(socketId, userData) {
    this.userRoles[socketId] = userData;

    if (userData.role === "student") {
      this.connectedUsers.students++;

      if (userData.name && !this.studentNames.includes(userData.name)) {
        this.studentNames.push(userData.name);
      }
    } else if (userData.role === "teacher") {
      this.connectedUsers.teachers++;
    }

    return {
      success: true,
      message: `${userData.role} connected`,
      userRole: userData,
    };
  }

  /**
   * Handle user disconnect
   * @param {string} socketId - Socket ID
   */
  handleUserDisconnect(socketId) {
    const role = this.userRoles[socketId];

    if (role) {
      if (role.role === "student") {
        this.connectedUsers.students = Math.max(
          0,
          this.connectedUsers.students - 1,
        );

        if (role.name && this.studentNames.includes(role.name)) {
          this.studentNames = this.studentNames.filter(
            (name) => name !== role.name,
          );
        }
      } else if (role.role === "teacher") {
        this.connectedUsers.teachers = Math.max(
          0,
          this.connectedUsers.teachers - 1,
        );
      }
    }

    delete this.userRoles[socketId];
  }

  /**
   * Get user role by socket ID
   * @param {string} socketId - Socket ID
   * @returns {Object|undefined} - User role object
   */
  getUserRole(socketId) {
    return this.userRoles[socketId];
  }

  /**
   * Get list of connected students
   * @returns {Array}
   */
  getConnectedStudents() {
    return [...this.studentNames];
  }

  /**
   * Get connection statistics
   * @param {number} responseCount - Current response count
   * @returns {Object}
   */
  getStats(responseCount = 0) {
    return {
      connectedStudents: this.connectedUsers.students,
      connectedTeachers: this.connectedUsers.teachers,
      responseCount,
    };
  }

  /**
   * Check if user is teacher
   * @param {string} socketId - Socket ID
   * @returns {boolean}
   */
  isTeacher(socketId) {
    const role = this.userRoles[socketId];
    return role && role.role === "teacher";
  }

  /**
   * Check if user is student
   * @param {string} socketId - Socket ID
   * @returns {boolean}
   */
  isStudent(socketId) {
    const role = this.userRoles[socketId];
    return role && role.role === "student";
  }

  /**
   * Kick a student
   * @param {string} studentName - Student name to kick
   * @returns {string|null} - Student socket ID or null
   */
  kickStudent(studentName) {
    let studentSocketId = null;

    Object.keys(this.userRoles).forEach((id) => {
      if (
        this.userRoles[id].role === "student" &&
        this.userRoles[id].name === studentName
      ) {
        studentSocketId = id;
      }
    });

    if (studentSocketId) {
      this.studentNames = this.studentNames.filter(
        (name) => name !== studentName,
      );
    }

    return studentSocketId;
  }

  /**
   * Clear all user data (for new session)
   */
  clear() {
    this.userRoles = {};
    this.studentNames = [];
    this.connectedUsers = { students: 0, teachers: 0 };
  }
}

export default SocketHandler;
