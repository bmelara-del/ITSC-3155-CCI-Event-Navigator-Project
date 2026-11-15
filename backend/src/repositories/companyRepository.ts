import type { Prisma, PrismaClient } from '../generated/prisma/client.ts'

const companySummarySelect = {
  companyId: true,
  slug: true,
  name: true,
  industry: true,
  description: true,
  website: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CompanySelect

const companyDetailsSelect = {
  ...companySummarySelect,
  roles: {
    orderBy: { title: 'asc' },
    select: {
      roleId: true,
      companyId: true,
      slug: true,
      title: true,
      description: true,
      location: true,
      employmentType: true,
      workArrangement: true,
      term: true,
      minimumExperienceLevelId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      minimumExperienceLevel: {
        select: {
          experienceLevelId: true,
          code: true,
          label: true,
          sortOrder: true,
        },
      },
      skills: {
        select: {
          skill: {
            select: {
              skillId: true,
              name: true,
              normalizedName: true,
            },
          },
        },
      },
      coursework: {
        select: {
          coursework: {
            select: {
              courseworkId: true,
              name: true,
              normalizedName: true,
            },
          },
        },
      },
      careerInterests: {
        select: {
          careerInterest: {
            select: {
              careerInterestId: true,
              code: true,
              label: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CompanySelect

type CompanySummary = Prisma.CompanyGetPayload<{
  select: typeof companySummarySelect
}>
type CompanyDetailsRecord = Prisma.CompanyGetPayload<{
  select: typeof companyDetailsSelect
}>
type CompanyRoleRecord = CompanyDetailsRecord['roles'][number]

export type CompanyDetails = Omit<CompanyDetailsRecord, 'roles'> & {
  roles: Array<
    Omit<CompanyRoleRecord, 'skills' | 'coursework' | 'careerInterests'> & {
      skills: CompanyRoleRecord['skills'][number]['skill'][]
      coursework: CompanyRoleRecord['coursework'][number]['coursework'][]
      careerInterests: CompanyRoleRecord['careerInterests'][number]['careerInterest'][]
    }
  >
}

export interface CompanyRepository {
  list(): Promise<CompanySummary[]>
  findById(companyId: string): Promise<CompanyDetails | null>
}

export function createCompanyRepository(
  prisma: PrismaClient,
): CompanyRepository {
  return {
    list() {
      return prisma.company.findMany({
        select: companySummarySelect,
        orderBy: { name: 'asc' },
      })
    },
    async findById(companyId) {
      const company = await prisma.company.findUnique({
        where: { companyId },
        select: companyDetailsSelect,
      })

      if (!company) {
        return null
      }

      return {
        ...company,
        roles: company.roles.map(
          ({ skills, coursework, careerInterests, ...role }) => ({
            ...role,
            skills: skills.map(({ skill }) => skill),
            coursework: coursework.map(({ coursework }) => coursework),
            careerInterests: careerInterests.map(
              ({ careerInterest }) => careerInterest,
            ),
          }),
        ),
      }
    },
  }
}
