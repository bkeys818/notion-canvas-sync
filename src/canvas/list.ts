import { getRequest } from './send-request'
import parseLinkHeader from 'parse-link-header'

export async function getEntireList(
    ...[params]: Parameters<typeof getRequest>
): Promise<any[]> {
    const items: any[] = []
    let nextUrl: string | undefined
    do {
        const res = await getRequest(params)
        items.push(...(await res.json()))
        nextUrl = parseLinkHeader(res.headers.get('link'))?.next?.url
        if (nextUrl) params = { token: params.token, url: nextUrl }
    } while (nextUrl)
    return items
}
