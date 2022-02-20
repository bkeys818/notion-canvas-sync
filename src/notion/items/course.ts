import { Item } from 'notion-databases'
import { getRichText } from '../utils'
import { extractId } from '../../canvas'
import type { Course as CanvasCourse } from '../../canvas'

export default class Course extends Item<CourseProps> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    readonly canvasUrl = this.properties['Canvas Url'].url!
    readonly canvasId = extractId(this.canvasUrl)
    private readonly name = getRichText(this.properties.Name.title)
    private readonly duration = this.properties.Duration.date

    updateWith(course: CanvasCourse) {
        const props: Parameters<typeof this.update>[0] = {}
        if (!this.name)
            props.Name = { title: [{ text: { content: course.name } }] }
        if (!this.duration && course.start_at)
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
    Error: 'rich_text'
}
