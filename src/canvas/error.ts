export class CanvasError extends Error {
    name = 'CanvasError'
    readonly status: string
    constructor(json: ErrorResponse) {
        super(json.errors[0].message)
        this.status = json.status
    }
}

interface ErrorResponse {
    status: string
    errors: { message: string }[]
}
