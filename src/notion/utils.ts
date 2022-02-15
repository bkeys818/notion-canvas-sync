import type Assignment from './items/assignment'

export const getRichText = (
    rich_text: Assignment['properties']['Canvas Id']['rich_text']
) =>
    rich_text.length != 0 && rich_text[0].type == 'text'
        ? rich_text[0].text.content
        : null
