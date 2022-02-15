import { NotionClient as APIClient, Database } from 'notion-databases'
import Assignment from './items/assignment'
import Course from './items/course'
export { Course, Assignment }

export default class NotionClient {
    private readonly client = new APIClient(this.token)
    constructor(
        private readonly token: string,
        private readonly databaseIds: DatabaseIds
    ) {}

    readonly courses = new Database(
        Course,
        this.client,
        this.databaseIds.courses,
        {
            property: 'Canvas Url',
            url: { is_not_empty: true },
            and: new Array({
                property: 'Sync',
                checkbox: { equals: true },
            }),
        }
    )

    readonly assignments = new Database(
        Assignment,
        this.client,
        this.databaseIds.assignments,
        {
            property: 'Canvas Id',
            rich_text: { is_not_empty: true },
        }
    )
}

export interface DatabaseIds {
    courses: string
    assignments: string
}

export interface AuthInfo {
    access_token: string
    workspace_id: string
    workspace_name: string | null
    workspace_icon: string | null
    bot_id: string
    owner: {
        object: 'user'
        id: string
        type?: 'person' | 'bot'
        name?: string
        avatar_url?: string
    }
}
