const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants/roles');

class AdminService {
  /**
   * Provision a new Administrator account (Admin-only)
   */
  async createAdmin({ name, email, password }) {
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: ROLES.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Provision a new Faculty account (Admin-only)
   */
  async createFaculty({ name, email, password }) {
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: ROLES.FACULTY,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Retrieve all administrators
   */
  async getAdmins() {
    const admins = await prisma.user.findMany({
      where: { role: ROLES.ADMIN },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            createdCourses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return admins;
  }

  /**
   * Retrieve all faculty with assigned course counts
   */
  async getFaculty() {
    const faculty = await prisma.user.findMany({
      where: { role: ROLES.FACULTY },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            assignedCourses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return faculty;
  }

  /**
   * Retrieve all students
   */
  async getStudents() {
    const students = await prisma.user.findMany({
      where: { role: ROLES.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return students;
  }
}

module.exports = new AdminService();
