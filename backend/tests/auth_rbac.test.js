const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

let adminCookie = '';
let faculty1Cookie = '';
let faculty2Cookie = '';
let studentCookie = '';

let faculty1Id = '';
let faculty2Id = '';
let course1Id = ''; // Assigned to Faculty 1
let course2Id = ''; // Assigned to Faculty 2

beforeAll(async () => {
  // Ensure DB connected and clean test records
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Test',
      email: 'admin.test@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const faculty1 = await prisma.user.create({
    data: {
      name: 'Faculty 1 Test',
      email: 'faculty1.test@example.com',
      passwordHash,
      role: 'FACULTY',
    },
  });
  faculty1Id = faculty1.id;

  const faculty2 = await prisma.user.create({
    data: {
      name: 'Faculty 2 Test',
      email: 'faculty2.test@example.com',
      passwordHash,
      role: 'FACULTY',
    },
  });
  faculty2Id = faculty2.id;

  const student = await prisma.user.create({
    data: {
      name: 'Student Test',
      email: 'student.test@example.com',
      passwordHash,
      role: 'STUDENT',
    },
  });

  // Create Sample Courses
  const c1 = await prisma.course.create({
    data: {
      title: 'Operating Systems',
      courseCode: 'CS302',
      description: 'Concurrency, memory management, file systems, and kernel architecture.',
      duration: '12 Weeks',
      facultyId: faculty1.id,
      createdById: admin.id,
    },
  });
  course1Id = c1.id;

  const c2 = await prisma.course.create({
    data: {
      title: 'Computer Networks',
      courseCode: 'CS304',
      description: 'TCP/IP stack, routing algorithms, socket programming, and transport protocols.',
      duration: '10 Weeks',
      facultyId: faculty2.id,
      createdById: faculty2.id,
    },
  });
  course2Id = c2.id;

  // Log in each user and capture cookies
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin.test@example.com', password: 'Password123!' });
  adminCookie = adminLogin.headers['set-cookie'][0];

  const fac1Login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'faculty1.test@example.com', password: 'Password123!' });
  faculty1Cookie = fac1Login.headers['set-cookie'][0];

  const fac2Login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'faculty2.test@example.com', password: 'Password123!' });
  faculty2Cookie = fac2Login.headers['set-cookie'][0];

  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student.test@example.com', password: 'Password123!' });
  studentCookie = studentLogin.headers['set-cookie'][0];
});

afterAll(async () => {
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('1. Authentication, Public Registration & Privilege Escalation Prevention', () => {
  it('Should reject unauthenticated requests to protected endpoints with 401', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Should allow login with valid credentials and return HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin.test@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('Should reject login with invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Should retrieve current user session with GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('Public registration MUST create a STUDENT account by default', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Normal Registered Student',
        email: 'regularstudent@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('regularstudent@example.com');
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('Public registration MUST NOT create ADMIN even if client explicitly sends role=ADMIN', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker Admin Attempt',
        email: 'attacker.admin@example.com',
        password: 'Password123!',
        role: 'ADMIN', // Client tries to escalate
      });

    expect(res.status).toBe(201);
    // Role MUST still be STUDENT, never ADMIN
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.user.role).not.toBe('ADMIN');

    // Double check DB directly
    const dbUser = await prisma.user.findUnique({
      where: { email: 'attacker.admin@example.com' },
    });
    expect(dbUser.role).toBe('STUDENT');
  });

  it('Public registration MUST NOT create FACULTY even if client explicitly sends role=FACULTY', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker Faculty Attempt',
        email: 'attacker.faculty@example.com',
        password: 'Password123!',
        role: 'FACULTY', // Client tries to escalate
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.user.role).not.toBe('FACULTY');

    const dbUser = await prisma.user.findUnique({
      where: { email: 'attacker.faculty@example.com' },
    });
    expect(dbUser.role).toBe('STUDENT');
  });

  it('Should reject registration with already registered email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Student',
        email: 'admin.test@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('2. Admin Management & Account Provisioning (ADMIN, FACULTY, STUDENT)', () => {
  it('Admin CAN create another Administrator via POST /api/admin/admins', async () => {
    const res = await request(app)
      .post('/api/admin/admins')
      .set('Cookie', [adminCookie])
      .send({
        name: 'Secondary Administrator',
        email: 'second.admin@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.email).toBe('second.admin@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();

    // Verify hashed in DB
    const dbUser = await prisma.user.findUnique({
      where: { email: 'second.admin@example.com' },
    });
    expect(dbUser.passwordHash).toBeDefined();
    expect(dbUser.passwordHash).not.toBe('Password123!');
  });

  it('Admin CAN create a Faculty member via POST /api/admin/faculty', async () => {
    const res = await request(app)
      .post('/api/admin/faculty')
      .set('Cookie', [adminCookie])
      .send({
        name: 'Dr. Newly Created',
        email: 'dr.newly@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('FACULTY');
    expect(res.body.data.user.email).toBe('dr.newly@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('Faculty MUST receive 403 Forbidden when attempting to create Admin', async () => {
    const res = await request(app)
      .post('/api/admin/admins')
      .set('Cookie', [faculty1Cookie])
      .send({
        name: 'Unauthorized Admin by Faculty',
        email: 'unauth.admin@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Faculty MUST receive 403 Forbidden when attempting to create Faculty', async () => {
    const res = await request(app)
      .post('/api/admin/faculty')
      .set('Cookie', [faculty1Cookie])
      .send({
        name: 'Unauthorized Faculty by Faculty',
        email: 'unauth.faculty@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Student MUST receive 403 Forbidden when attempting to create Admin', async () => {
    const res = await request(app)
      .post('/api/admin/admins')
      .set('Cookie', [studentCookie])
      .send({
        name: 'Unauthorized Admin by Student',
        email: 'student.fakeadmin@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Student MUST receive 403 Forbidden when attempting to create Faculty', async () => {
    const res = await request(app)
      .post('/api/admin/faculty')
      .set('Cookie', [studentCookie])
      .send({
        name: 'Unauthorized Faculty by Student',
        email: 'student.fakefaculty@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Unauthenticated user MUST receive 401 Unauthorized for /api/admin/admins and /api/admin/faculty', async () => {
    const resAdmin = await request(app)
      .post('/api/admin/admins')
      .send({
        name: 'Anon Admin',
        email: 'anon.admin@example.com',
        password: 'Password123!',
      });
    expect(resAdmin.status).toBe(401);

    const resFaculty = await request(app)
      .post('/api/admin/faculty')
      .send({
        name: 'Anon Faculty',
        email: 'anon.faculty@example.com',
        password: 'Password123!',
      });
    expect(resFaculty.status).toBe(401);
  });
});

describe('3. Admin RBAC Authorization on Courses', () => {
  let createdCourseId = '';

  it('Admin CAN create a course assigned to any faculty member', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', [adminCookie])
      .send({
        title: 'Compiler Design',
        courseCode: 'CS402',
        description: 'Lexical analysis, parsing, AST generation, and LLVM code generation.',
        duration: '14 Weeks',
        facultyId: faculty1Id,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.courseCode).toBe('CS402');
    expect(res.body.data.course.facultyId).toBe(faculty1Id);
    createdCourseId = res.body.data.course.id;
  });

  it('Admin CAN view all courses regardless of faculty assignment', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.courses.length).toBeGreaterThanOrEqual(3);
  });

  it('Admin CAN update any course', async () => {
    const res = await request(app)
      .patch(`/api/courses/${createdCourseId}`)
      .set('Cookie', [adminCookie])
      .send({
        title: 'Advanced Compiler Design & Optimization',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.course.title).toBe('Advanced Compiler Design & Optimization');
  });

  it('Admin CAN delete any course', async () => {
    const res = await request(app)
      .delete(`/api/courses/${createdCourseId}`)
      .set('Cookie', [adminCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('4. Faculty RBAC Authorization & Ownership Rules', () => {
  let facultyCreatedCourseId = '';

  it('Faculty CAN create a course assigned to themselves', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', [faculty1Cookie])
      .send({
        title: 'Theory of Computation',
        courseCode: 'CS305',
        description: 'Finite automata, Turing machines, decidability, and complexity classes.',
        duration: '10 Weeks',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.course.facultyId).toBe(faculty1Id);
    facultyCreatedCourseId = res.body.data.course.id;
  });

  it('Faculty can ONLY see their assigned courses in GET /api/courses', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Cookie', [faculty1Cookie]);

    expect(res.status).toBe(200);
    const courses = res.body.data.courses;
    courses.forEach((c) => {
      expect(c.facultyId).toBe(faculty1Id);
    });
  });

  it('Faculty CAN update their own assigned course', async () => {
    const res = await request(app)
      .patch(`/api/courses/${facultyCreatedCourseId}`)
      .set('Cookie', [faculty1Cookie])
      .send({
        duration: '12 Weeks',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.course.duration).toBe('12 Weeks');
  });

  it('Faculty MUST receive 403 Forbidden when attempting to update another faculty\'s course', async () => {
    const res = await request(app)
      .patch(`/api/courses/${course2Id}`)
      .set('Cookie', [faculty1Cookie])
      .send({
        title: 'Malicious Faculty Update',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Faculty MUST receive 403 Forbidden when attempting to delete another faculty\'s course', async () => {
    const res = await request(app)
      .delete(`/api/courses/${course2Id}`)
      .set('Cookie', [faculty1Cookie]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Faculty CAN delete their own course', async () => {
    const res = await request(app)
      .delete(`/api/courses/${facultyCreatedCourseId}`)
      .set('Cookie', [faculty1Cookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('5. Student RBAC Authorization (Read-Only)', () => {
  it('Student CAN view available courses', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Cookie', [studentCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.courses).toBeDefined();
  });

  it('Student CAN view single course details', async () => {
    const res = await request(app)
      .get(`/api/courses/${course1Id}`)
      .set('Cookie', [studentCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.course.id).toBe(course1Id);
  });

  it('Student MUST receive 403 Forbidden when attempting to create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', [studentCookie])
      .send({
        title: 'Unauthorized Student Course',
        courseCode: 'CS999',
        description: 'Should fail backend validation and RBAC checks.',
        duration: '4 Weeks',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Student MUST receive 403 Forbidden when attempting to update a course', async () => {
    const res = await request(app)
      .patch(`/api/courses/${course1Id}`)
      .set('Cookie', [studentCookie])
      .send({
        title: 'Unauthorized Modification',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Student MUST receive 403 Forbidden when attempting to delete a course', async () => {
    const res = await request(app)
      .delete(`/api/courses/${course1Id}`)
      .set('Cookie', [studentCookie]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('6. Data Validation & Constraints', () => {
  it('Should reject duplicate course code with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', [adminCookie])
      .send({
        title: 'Duplicate Code Course',
        courseCode: 'CS302', // Already exists as course1Id
        description: 'Testing duplicate courseCode constraint.',
        duration: '8 Weeks',
        facultyId: faculty1Id,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Should reject course creation with invalid/missing title with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', [adminCookie])
      .send({
        title: 'A', // Too short (min 3)
        courseCode: 'CS777',
        description: 'Valid description text for testing validation.',
        duration: '8 Weeks',
        facultyId: faculty1Id,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
