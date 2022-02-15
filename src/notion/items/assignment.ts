import { Item, Page, Properties } from 'notion-databases'
import { datesAreEqual } from '../date'
import { getRichText } from '../utils'
import type { Assignment as CanvasAssignment } from '../../canvas'

export default class Assignment extends Item<AssignmentProps> {
    readonly canvasId = getRichText(this.properties['Canvas Id'].rich_text)
    private readonly title = getRichText(this.properties['Title'].title)
    private readonly dueDate = this.properties['Due Date'].date
    private readonly complete = this.properties.Complete.checkbox

    constructor(
        data: Page<AssignmentProps>,
        newPage: ConstructorParameters<typeof Item>[1]
    ) {
        super(data, newPage)
    }

    updateWith(assignment: CanvasAssignment) {
        const props: Parameters<typeof this.update>[0] = {}
        if (!this.title)
            props.Title = { title: [{ text: { content: assignment.name } }] }
        if (
            datesAreEqual(this.dueDate, {
                start: assignment.due_at ?? undefined,
            })
        )
            props['Due Date'] = {
                date: assignment.due_at
                    ? { start: assignment.due_at, end: null, time_zone: null }
                    : null,
            }
        if (this.complete != assignment.has_submitted_submissions)
            props.Complete = { checkbox: assignment.has_submitted_submissions }

        return this.update(props)
    }

    static convertProps(
        assignment: CanvasAssignment,
        institution: string,
        courseId: string
    ): Partial<Properties<AssignmentProps>> {
        return {
            Title: { title: [{ text: { content: assignment.name } }] },
            'Canvas Id': {
                rich_text: [
                    { text: { content: [institution, assignment.id].join('/') } },
                ],
            },
            'Due Date': { date: assignment.due_at
                ? { start: assignment.due_at } 
                : null,
            },
            Complete: { checkbox: assignment.has_submitted_submissions },
            Course: { relation: [{ id: courseId }] },
        }
    }
}

type AssignmentProps = {
    Title: 'title'
    'Canvas Id': 'rich_text'
    'Due Date': 'date'
    Complete: 'checkbox'
    Course: 'relation'
    Type: 'multi_select'
}
