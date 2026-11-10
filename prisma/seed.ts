import { PrismaClient, Role, DepartmentType, IssueCategory, IssueStatus, UrgencyLevel, ProjectStatus, ConflictStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Naatukoottam Neon PostgreSQL seed...');

  const passwordHash = await bcrypt.hash('KeralaCivic2026!', 10);

  // 1. Seed Departments
  console.log('Seeding departments...');
  const pwd = await prisma.department.upsert({
    where: { code: 'PWD' },
    update: {},
    create: {
      id: 'dept_pwd_01',
      name: 'Public Works Department (PWD)',
      code: 'PWD',
      type: DepartmentType.PWD,
      district: 'Ernakulam',
      contactEmail: 'roads.ernakulam@keralapwd.gov.in',
      contactPhone: '+91 484 2422001',
    },
  });

  const kwa = await prisma.department.upsert({
    where: { code: 'KWA' },
    update: {},
    create: {
      id: 'dept_kwa_01',
      name: 'Kerala Water Authority (KWA)',
      code: 'KWA',
      type: DepartmentType.KERALA_WATER_AUTHORITY,
      district: 'Ernakulam',
      contactEmail: 'se.kochi@kwa.kerala.gov.in',
      contactPhone: '+91 484 2360645',
    },
  });

  const kseb = await prisma.department.upsert({
    where: { code: 'KSEB' },
    update: {},
    create: {
      id: 'dept_kseb_01',
      name: 'Kerala State Electricity Board (KSEB)',
      code: 'KSEB',
      type: DepartmentType.KSEB,
      district: 'Ernakulam',
      contactEmail: 'ee.kakkanad@kseb.in',
      contactPhone: '+91 484 2422003',
    },
  });

  const lsgd = await prisma.department.upsert({
    where: { code: 'LSGD' },
    update: {},
    create: {
      id: 'dept_lsgd_01',
      name: 'Local Self Government / Grama Panchayat',
      code: 'LSGD',
      type: DepartmentType.PANCHAYAT_LSGD,
      district: 'Ernakulam',
      contactEmail: 'thrikkakara.municipality@kerala.gov.in',
      contactPhone: '+91 484 2577700',
    },
  });

  // 2. Seed Users
  console.log('Seeding users...');
  const uditsmith = await prisma.user.upsert({
    where: { phone: '+919846000001' },
    update: {},
    create: {
      id: 'user_uditsmith_01',
      phone: '+919846000001',
      email: 'uditsmith@naatukoottam.kerala.gov.in',
      fullName: 'Uditsmith Thakuria',
      passwordHash,
      role: Role.CITIZEN,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      preferredLang: 'ml',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const anidhya = await prisma.user.upsert({
    where: { phone: '+919846000002' },
    update: {},
    create: {
      id: 'user_anidhya_02',
      phone: '+919846000002',
      email: 'anidhya@naatukoottam.kerala.gov.in',
      fullName: 'Anidhya Sharma',
      passwordHash,
      role: Role.CITIZEN,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      preferredLang: 'en',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const officialPwd = await prisma.user.upsert({
    where: { phone: '+919846000003' },
    update: {},
    create: {
      id: 'user_official_pwd',
      phone: '+919846000003',
      email: 'ae.pwd.kakkanad@kerala.gov.in',
      fullName: 'Er. Rajesh Chandran (PWD)',
      passwordHash,
      role: Role.DEPARTMENT_OFFICIAL,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  await prisma.departmentOfficial.upsert({
    where: { userId: officialPwd.id },
    update: {},
    create: {
      id: 'official_profile_pwd',
      userId: officialPwd.id,
      departmentId: pwd.id,
      designation: 'Assistant Executive Engineer (Roads)',
      jurisdiction: 'Kakkanad & Thrikkakara Division',
      badgeNumber: 'PWD-ERN-2024-88',
    },
  });

  // 3. Seed Posts
  console.log('Seeding posts...');
  const post1 = await prisma.post.upsert({
    where: { id: 'seed_post_01' },
    update: {},
    create: {
      id: 'seed_post_01',
      authorId: anidhya.id,
      content: 'Potholes in front of Fresco Hotel on Infopark Expressway. Vehicles are struggling to pass through and two-wheelers are skidding during rains. Need urgent fixing before the monsoon gets worse!',
      category: IssueCategory.ROAD_TRANSPORT,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      latitude: 10.0159,
      longitude: 76.3419,
      language: 'en',
      media: {
        create: [
          {
            mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
            mediaType: 'IMAGE',
          },
        ],
      },
      likes: {
        create: [{ userId: uditsmith.id }],
      },
    },
  });

  // 4. Seed Civic Issues
  console.log('Seeding civic issues...');
  const issue1 = await prisma.issue.upsert({
    where: { id: 'seed_issue_01' },
    update: {},
    create: {
      id: 'seed_issue_01',
      title: 'Deep crater potholes on Infopark Expressway near Fresco Hotel',
      description: 'Multiple large craters formed after heavy rain. High risk for two-wheelers traveling to Infopark.',
      category: IssueCategory.ROAD_TRANSPORT,
      urgency: UrgencyLevel.HIGH,
      status: IssueStatus.VERIFIED,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      address: 'Near Fresco Hotel, Infopark Expressway, Kakkanad',
      latitude: 10.0159,
      longitude: 76.3419,
      reporterId: anidhya.id,
      assignedDeptId: pwd.id,
      evidences: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
            mediaType: 'IMAGE',
            uploadedById: anidhya.id,
          },
        ],
      },
      supports: {
        create: [{ userId: uditsmith.id }],
      },
      history: {
        create: [
          {
            actorId: anidhya.id,
            toStatus: IssueStatus.REPORTED,
            notes: 'Citizen reported via Naatukoottam GPS',
          },
          {
            actorId: officialPwd.id,
            fromStatus: IssueStatus.REPORTED,
            toStatus: IssueStatus.VERIFIED,
            notes: 'Site inspected by PWD Sub-Division Engineer. Asphalt resurfacing required.',
          },
        ],
      },
    },
  });

  // 5. Seed Infrastructure Projects & Conflict Engine Test
  console.log('Seeding infrastructure projects & overlap conflict...');
  const projPwd = await prisma.infrastructureProject.upsert({
    where: { id: 'seed_proj_pwd_01' },
    update: {},
    create: {
      id: 'seed_proj_pwd_01',
      name: 'Thrikkakara - Kakkanad Link Road Tarring & Resurfacing',
      description: 'Complete asphalt resurfacing and shoulder leveling of 2.4 km stretch.',
      departmentId: pwd.id,
      category: IssueCategory.ROAD_TRANSPORT,
      status: ProjectStatus.APPROVED,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      roadName: 'Seaport-Airport Road Junction',
      latitude: 10.0159,
      longitude: 76.3419,
      radiusMeters: 200.0,
      estimatedCost: 4500000,
      startDate: new Date('2026-11-20'),
      expectedEndDate: new Date('2026-12-10'),
      contractorName: 'Kerala State Construction Corporation',
    },
  });

  const projKwa = await prisma.infrastructureProject.upsert({
    where: { id: 'seed_proj_kwa_01' },
    update: {},
    create: {
      id: 'seed_proj_kwa_01',
      name: 'Underground Feeder Pipeline Replacement Project',
      description: 'Excavation and replacement of 400mm cast iron water transmission main.',
      departmentId: kwa.id,
      category: IssueCategory.WATER_SUPPLY,
      status: ProjectStatus.PLANNED,
      district: 'Ernakulam',
      locality: 'Kakkanad',
      roadName: 'Seaport-Airport Road Junction',
      latitude: 10.0162,
      longitude: 76.3421,
      radiusMeters: 180.0,
      estimatedCost: 6200000,
      startDate: new Date('2026-11-25'),
      expectedEndDate: new Date('2026-12-28'),
      contractorName: 'South Indian Infrastructure Ltd',
    },
  });

  // Register the collision conflict between PWD Road Resurfacing and KWA Pipeline Digging
  await prisma.projectConflict.upsert({
    where: {
      projectAId_projectBId: {
        projectAId: projPwd.id,
        projectBId: projKwa.id,
      },
    },
    update: {},
    create: {
      projectAId: projPwd.id,
      projectBId: projKwa.id,
      distanceMeters: 45.0,
      dateOverlapDays: 16,
      status: ConflictStatus.POTENTIAL,
      notes: 'High severity conflict: PWD resurfacing starts Nov 20, but KWA pipeline excavation begins Nov 25 at the exact same location (45m offset).',
      jointPlan: 'Postpone PWD asphalt resurfacing by 3 weeks until KWA completes pipe trenching, pressure testing, and backfilling to prevent new road destruction.',
    },
  });

  console.log('✅ Naatukoottam seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
