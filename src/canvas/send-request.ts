import { extractId, type ItemId } from '.'
import fetch from 'node-fetch'
import { URL } from 'url'
import { CanvasError } from './error'

export async function get(...[params]: Parameters<typeof getRequest>) {
    const res = await getRequest(params)
    return res.json()
}

export async function getRequest(
    params: DirectRequestParams | CustomRequestParams
) {
    let institution: string
    let urlString: string
    if ('url' in params) {
        institution = extractId(params.url)[0]
        urlString = params.url
    } else {
        institution = params.institution
        const url = new URL(
            `https://${institution}.instructure.com/api/v1/${params.path}`
        )
        const setParam = (key: string, value: boolean | string | number) =>
            url.searchParams.append(key, value.toString())
        for (const key in params.query) {
            const value = params.query[key]
            if (Array.isArray(value))
                value.forEach((item: any) => setParam(key, item))
            else setParam(key, value)
        }
        urlString = url.href
    }

    const res = await fetch(urlString, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + params.token,
            'Content-Type': 'application/json',
        },
    })
    if (res.ok) return res
    else {
        let err: Error
        try {
            err = new CanvasError(await res.json())
        } catch {
            err = new Error(res.statusText)
        }
        throw err
    }
}

type UrlParamValue = boolean | string | number | boolean[] | string[] | number[]
interface RequestParams {
    token: string
}
interface CustomRequestParams extends RequestParams {
    institution: ItemId[0]
    path: string
    query?: Record<string, UrlParamValue>
}
interface DirectRequestParams extends RequestParams {
    url: string
}
