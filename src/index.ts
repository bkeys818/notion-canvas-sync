import CanvasClient, * as Canvas from './canvas'
import NotionClient, * as Notion from './notion'

export default async function syncNotionAndCanvas(userData: UserData) {
    const canvas = new CanvasClient(userData.canvasTokens)
    const notion = new NotionClient(
        userData.notionAuthInfo.access_token,
        userData.notionIds
    )

    const notionCourses = await notion.courses.items
    const promiseArrays = await Promise.all(
        notionCourses.flatMap(notionCourse => {
            const canvasCourseId = Canvas.extractId(notionCourse.canvasUrl)

            return [
                syncCourse(notionCourse, canvasCourseId),
                syncAssignments(notionCourse, canvasCourseId),
            ] as const
        })
    )

    const promises = promiseArrays.flatMap(value => value)

    return await Promise.all<typeof promises[number]>(promises)

    async function syncCourse(
        notionCourse: Notion.Course,
        canvasId: Canvas.ItemId
    ) {
        const canvasCourse = await canvas.getCourse(canvasId)
        return [notionCourse.updateWith(canvasCourse)]
    }

    async function syncAssignments(
        notionCourse: Notion.Course,
        canvasCourseId: Canvas.ItemId
    ) {
        const [canvasAssignments, notionAssignments] = await Promise.all([
            canvas.getAssignments(canvasCourseId),
            notion.assignments.items,
        ])
        return canvasAssignments.map(canvasAssignment => {
            const notionAssignment = notionAssignments.find(
                assignment =>
                    assignment.canvasId ==
                    [canvasCourseId[0], canvasAssignment.id].join('/')
            )
            if (notionAssignment)
                return notionAssignment.updateWith(canvasAssignment)
            else
                return notion.assignments.newItem(
                    Notion.Assignment.convertProps(
                        canvasAssignment,
                        canvasCourseId[0],
                        notionCourse['id']
                    )
                )
        })
    }
}

export interface UserData {
    notionAuthInfo: Notion.AuthInfo
    notionIds: Notion.DatabaseIds
    canvasTokens: {
        institution: string
        token: string
    }[]
}
