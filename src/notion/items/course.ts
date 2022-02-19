import { Item } from 'notion-databases'
import { datesAreEqual } from '../date'
import { getRichText } from '../utils'
import { extractId } from '../../canvas'
import type { Course as CanvasCourse } from '../../canvas'

export default class Course extends Item<CourseProps> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    readonly canvasUrl = this.properties['Canvas Url'].url!
    readonly canvasId = extractId(this.canvasUrl)
    readonly customProps = (() => {
        const keys = Object.keys(this.properties)
        return this.properties['Custom Props'].multi_select
            .map(obj => obj.name)
            .filter((key): key is keyof Course['properties'] =>
                keys.includes(key)
            )
    })()
    private readonly name = getRichText(this.properties.Name.title)
    private readonly duration = this.properties.Duration.date

    updateWith(course: CanvasCourse) {
        const props: Parameters<typeof this.update>[0] = {}

        if (!this.name || !this.customProps.includes('Name'))
            props.Name = { title: [{ text: { content: course.name } }] }
        if (
            !this.customProps.includes('Duration') &&
            course.start_at != null &&
            datesAreEqual(this.duration, {
                start: course.start_at,
                end: course.end_at ?? undefined,
            })
        )
            props.Duration = {
                date: {
                    start: course.start_at,
                    end: course.end_at,
                    time_zone: null,
                },
            }

        props['Last Synced'] = { date: { start: new Date().toISOString() } }

        return this.update(props)
    }
}

type CourseProps = {
    Name: 'title'
    Duration: 'date'
    Sync: 'checkbox'
    'Canvas Url': 'url'
    'Last Synced': 'date'
    'Custom Props': 'multi_select'
    Error: 'rich_text'
}
