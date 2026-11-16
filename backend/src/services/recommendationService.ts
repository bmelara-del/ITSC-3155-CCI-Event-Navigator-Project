import {
  rankRoles,
  type MatchResult,
  type StudentProfileInput,
} from '../matching/scoreMatch.ts'
import type { MatchingProfileRepository } from '../repositories/matchingProfileRepository.ts'
import type { RecommendationRepository } from '../repositories/recommendationRepository.ts'

export interface RecommendedRole {
  roleId: string
  title: string
  companyId: string
  companyName: string
  companySlug: string
  score: number
  factors: MatchResult['factors']
  matchedSkills: string[]
  missingSkills: string[]
  missingCoursework: string[]
  note: string
}

export type RecommendationServiceResult =
  | { status: 'missing-profile' }
  | { status: 'found'; recommendations: RecommendedRole[] }

export interface RecommendationService {
  getRecommendations(): Promise<RecommendationServiceResult>
}

export function createRecommendationService(
  matchingProfileRepository: MatchingProfileRepository,
  recommendationRepository: RecommendationRepository,
): RecommendationService {
  return {
    async getRecommendations() {
      const profile = await matchingProfileRepository.findForStudent()

      if (!profile) {
        return { status: 'missing-profile' }
      }

      const student: StudentProfileInput = {
        careerInterest: profile.careerInterest,
        skills: profile.skills,
        coursework: profile.coursework,
        experienceLevel: profile.experienceLevel,
      }
      const roles = await recommendationRepository.listActiveRoles()
      const rolesById = new Map(roles.map((role) => [role.roleId, role]))

      const recommendations = rankRoles(student, roles).map((match) => {
        const role = rolesById.get(match.roleId)

        if (!role) {
          throw new Error(
            `Ranked role ${match.roleId} was not returned by the recommendation repository.`,
          )
        }

        return {
          roleId: match.roleId,
          title: match.title,
          companyId: role.company.companyId,
          companyName: role.company.name,
          companySlug: role.company.slug,
          score: match.score,
          factors: match.factors,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
          missingCoursework: match.missingCoursework,
          note: match.note,
        }
      })

      return { status: 'found', recommendations }
    },
  }
}
