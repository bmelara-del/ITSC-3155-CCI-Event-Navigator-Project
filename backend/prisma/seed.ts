import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../src/generated/prisma/client.ts'

const careerInterests = [
  { code: 'software-engineering', label: 'Software Engineering' },
  { code: 'cybersecurity', label: 'Cybersecurity' },
  { code: 'data-science', label: 'Data Science' },
  { code: 'it-other', label: 'IT & Other' },
]

const experienceLevels = [
  { code: 'beginner-no-internship', label: 'Beginner / No internship', sortOrder: 1 },
  { code: 'project-or-work-experience', label: 'Some project or work experience', sortOrder: 2 },
  { code: 'previous-internship', label: 'Previous internship experience', sortOrder: 3 },
]

const courseworkNames = [
  'Introduction to Programming',
  'Data Structures',
  'Computer Networks',
  'Operating Systems',
  'Database Design',
  'Software Engineering',
  'Machine Learning',
  'Cybersecurity Fundamentals',
  'Cloud Computing',
]

const sampleCompanies = [
  {
    slug: 'northwind-analytics',
    name: 'Northwind Analytics',
    industry: 'Data & Analytics',
    description:
      'A sample data and analytics employer helping organizations turn information into clear decisions. This is placeholder content for the prototype.',
    roles: [
      {
        slug: 'data-analyst-intern',
        title: 'Data Analyst Intern',
        skills: ['SQL', 'Python', 'Data Visualization'],
        coursework: ['Database Design', 'Machine Learning'],
        careerInterests: ['Data Science'],
      },
    ],
  },
  {
    slug: 'company-a',
    name: 'Company A',
    industry: 'Technology',
    description:
      'A sample technology employer developing software products and services. This description is placeholder content for the prototype.',
    roles: [
      {
        slug: 'software-engineering',
        title: 'Software Engineering',
        skills: ['Java', 'SQL', 'Git'],
        coursework: ['Introduction to Programming', 'Data Structures', 'Software Engineering'],
        careerInterests: ['Software Engineering'],
      },
    ],
  },
  {
    slug: 'company-b',
    name: 'Company B',
    industry: 'Financial Services',
    description:
      'A sample financial services employer offering opportunities in software development and financial technology.',
    roles: [
      {
        slug: 'software-development',
        title: 'Software Development',
        skills: ['Python', 'SQL', 'Cloud'],
        coursework: ['Introduction to Programming', 'Database Design'],
        careerInterests: ['Software Engineering', 'Data Science'],
      },
    ],
  },
  {
    slug: 'company-c',
    name: 'Company C',
    industry: 'Cybersecurity',
    description:
      'A sample cybersecurity employer focused on protecting systems, networks, and data.',
    roles: [
      {
        slug: 'security-analyst',
        title: 'Security Analyst',
        skills: ['Linux', 'Networking'],
        coursework: ['Computer Networks', 'Operating Systems', 'Cybersecurity Fundamentals'],
        careerInterests: ['Cybersecurity'],
      },
    ],
  },
  {
    slug: 'company-d',
    name: 'Company D',
    industry: 'Technology Consulting',
    description:
      'A sample technology consulting employer helping organizations solve business challenges with technology.',
    roles: [
      {
        slug: 'it-consulting',
        title: 'IT Consulting',
        skills: ['Javascript', 'React'],
        coursework: ['Introduction to Programming', 'Computer Networks'],
        careerInterests: ['IT & Other'],
      },
    ],
  },
  {
    slug: 'company-e',
    name: 'Company E',
    industry: 'Technology',
    description:
      'A sample technology employer developing software products and services for a range of users.',
    roles: [
      {
        slug: 'software-engineering',
        title: 'Software Engineering',
        skills: ['Java', 'SQL', 'Git'],
        coursework: ['Introduction to Programming', 'Data Structures', 'Software Engineering'],
        careerInterests: ['Software Engineering'],
      },
    ],
  },
  {
    slug: 'company-f',
    name: 'Company F',
    industry: 'Financial Services',
    description:
      'A sample financial services employer offering opportunities in software development and financial technology.',
    roles: [
      {
        slug: 'software-development',
        title: 'Software Development',
        skills: ['Python', 'SQL', 'Cloud'],
        coursework: ['Introduction to Programming', 'Database Design'],
        careerInterests: ['Software Engineering', 'Data Science'],
      },
    ],
  },
  {
    slug: 'company-g',
    name: 'Company G',
    industry: 'Healthcare Technology',
    description:
      'A sample healthcare technology employer using data to support better services and decisions.',
    roles: [
      {
        slug: 'data-analyst',
        title: 'Data Analyst',
        skills: ['Python', 'Excel', 'SQL'],
        coursework: ['Database Design', 'Machine Learning'],
        careerInterests: ['Data Science'],
      },
    ],
  },
  {
    slug: 'company-h',
    name: 'Company H',
    industry: 'Retail',
    description:
      'A sample retail employer focused on improving customer experiences through thoughtful design.',
    roles: [
      {
        slug: 'ux-designer',
        title: 'UX Designer',
        skills: ['Figma', 'Research', 'Prototyping'],
        coursework: [],
        careerInterests: ['IT & Other'],
      },
    ],
  },
  {
    slug: 'company-i',
    name: 'Company I',
    industry: 'Energy',
    description:
      'A sample energy employer building cloud infrastructure for reliable, efficient services.',
    roles: [
      {
        slug: 'cloud-engineer',
        title: 'Cloud Engineer',
        skills: ['AWS', 'Linux', 'Terraform'],
        coursework: ['Operating Systems', 'Cloud Computing'],
        careerInterests: ['IT & Other'],
      },
    ],
  },
]

function normalizedName(name: string): string {
  return name.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
}

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const careerInterestByLabel = new Map<string, string>()
    for (const interest of careerInterests) {
      const saved = await prisma.careerInterest.upsert({
        where: { code: interest.code },
        update: {},
        create: interest,
      })
      careerInterestByLabel.set(saved.label, saved.careerInterestId)
    }

    for (const level of experienceLevels) {
      await prisma.experienceLevel.upsert({
        where: { code: level.code },
        update: {},
        create: level,
      })
    }

    const skillNames = new Set(sampleCompanies.flatMap((company) => company.roles.flatMap((role) => role.skills)))
    const skillIdByName = new Map<string, string>()
    for (const name of skillNames) {
      const saved = await prisma.skill.upsert({
        where: { normalizedName: normalizedName(name) },
        update: {},
        create: { name, normalizedName: normalizedName(name) },
      })
      skillIdByName.set(name, saved.skillId)
    }

    const courseworkIdByName = new Map<string, string>()
    for (const name of courseworkNames) {
      const saved = await prisma.coursework.upsert({
        where: { normalizedName: normalizedName(name) },
        update: {},
        create: { name, normalizedName: normalizedName(name) },
      })
      courseworkIdByName.set(name, saved.courseworkId)
    }

    for (const sample of sampleCompanies) {
      const company = await prisma.company.upsert({
        where: { slug: sample.slug },
        update: {},
        create: {
          slug: sample.slug,
          name: sample.name,
          industry: sample.industry,
          description: sample.description,
        },
      })

      for (const sampleRole of sample.roles) {
        const role = await prisma.role.upsert({
          where: { companyId_slug: { companyId: company.companyId, slug: sampleRole.slug } },
          update: {},
          create: {
            companyId: company.companyId,
            slug: sampleRole.slug,
            title: sampleRole.title,
          },
        })

        for (const skillName of sampleRole.skills) {
          const skillId = skillIdByName.get(skillName)
          if (!skillId) throw new Error(`Seed skill was not created: ${skillName}`)
          await prisma.roleSkill.upsert({
            where: { roleId_skillId: { roleId: role.roleId, skillId } },
            update: {},
            create: { roleId: role.roleId, skillId },
          })
        }

        for (const courseworkName of sampleRole.coursework) {
          const courseworkId = courseworkIdByName.get(courseworkName)
          if (!courseworkId) throw new Error(`Seed coursework was not created: ${courseworkName}`)
          await prisma.roleCoursework.upsert({
            where: { roleId_courseworkId: { roleId: role.roleId, courseworkId } },
            update: {},
            create: { roleId: role.roleId, courseworkId },
          })
        }

        for (const interestLabel of sampleRole.careerInterests) {
          const careerInterestId = careerInterestByLabel.get(interestLabel)
          if (!careerInterestId) throw new Error(`Seed career interest was not created: ${interestLabel}`)
          await prisma.roleCareerInterest.upsert({
            where: { roleId_careerInterestId: { roleId: role.roleId, careerInterestId } },
            update: {},
            create: { roleId: role.roleId, careerInterestId },
          })
        }
      }
    }

    console.info('Seeded illustrative companies, roles, and matching catalogs.')
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

seed().catch((error: unknown) => {
  console.error('Development seed failed.', error)
  process.exitCode = 1
})
