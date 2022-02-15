import type { Assignment } from '.'

export const datesAreEqual = (
    notionDate: Assignment['dueDate'],
    canvasDate?: {
        start?: string
        end?: string
        time_zone?: string
    }) =>
    areEqual(canvasDate?.start, notionDate?.start) &&
    areEqual(canvasDate?.end, notionDate?.end) &&
    canvasDate?.time_zone == notionDate?.time_zone

const areEqual = (a?: string | null, b?: string | null) =>
    (a && b && new Date(a).toString() == new Date(b).toString()) ||
    a == b
