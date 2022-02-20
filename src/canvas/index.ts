import { get } from './send-request'
import { getEntireList } from './list'
import type { UserData } from '../'

export default class CanvasClient {
    private readonly tokens: Record<string, string> = {}
    constructor(tokens: UserData['canvasTokens']) {
        for (const { institution, token } of tokens) {
            this.tokens[institution] = token
        }
    }

    readonly courses: Record<string, Course> = {}
    readonly assignments: Record<string, Assignment[]> = {}

    getDataForCourses = (ids: ItemId[]) =>
        Promise.all(
            ids.map(id => {
                const idStr = id.join('/')
                return Promise.all([
                    this.getCourse(id).then(
                        course => (this.courses[idStr] = course)
                    ),
                    this.getAssignments(id).then(
                        assignment => (this.assignments[idStr] = assignment)
                    ),
                ])
            })
        )

    getCourse(courseId: ItemId): Promise<Course> {
        const institution = courseId[0]
        return get({
            token: this.tokens[institution],
            institution,
            path: `courses/${courseId[1]}`,
        })
    }

    getAssignments(courseId: ItemId): Promise<Assignment[]> {
        const institution = courseId[0]
        return getEntireList({
            token: this.tokens[institution],
            institution,
            path: `courses/${courseId[1]}/assignments`,
        })
    }
}

export interface Course {
    id: number
    name: string
    uuid: string
    start_at: string | null
    end_at: string | null
    original_name: string
    // friendly_name: null
    enrollment_term_id: number
    course_code: string // undefined?
}

export interface Assignment {
    id: number
    name: string
    description: string
    due_at: string | null
    lock_at: string | null
    unlock_at: string | null
    course_id: number
    html_url: string
    points_possible: number
    submission_types: (
        | 'discussion_topic'
        | 'online_quiz'
        | 'on_paper'
        | 'none'
        | 'external_tool'
        | 'online_text_entry'
        | 'online_url'
        | 'online_upload'
    )[]
    has_submitted_submissions: boolean
    grading_type:
        | 'pass_fail'
        | 'percent'
        | 'letter_grade'
        | 'gpa_scale'
        | 'points'
    quiz_id?: number
    /**
     * The number of submission attempts a student can make for this assignment.
     * -1 is considered unlimited.
     */
    allowed_attempts: number
    in_closed_grading_period?: boolean
    is_quiz_assignment?: boolean
    important_dates?: boolean
    muted?: boolean
    locked_for_user?: boolean
    submissions_download_url?: string
    require_lockdown_browser?: boolean
}

export function extractId(urlStr: string): ItemId {
    const url = new URL(urlStr)
    const institution = url.hostname.slice(0, url.hostname.indexOf('.'))
    for (const step of url.pathname.split('/').reverse()) {
        if (/\d+/.test(step)) return [institution, parseInt(step)]
    }
    throw new Error('Invalid URL')
}
export type ItemId = [string, number]
