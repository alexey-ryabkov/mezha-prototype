// Ссылки на виджет. На сайте поселка они вели бы на страницу с генпланом, в прототипе ведут на виджет.
const widgetUrl = (query: string) => `${location.origin}${import.meta.env.BASE_URL}#/widget?${query}`

export const plotLink = (number: string) => widgetUrl(`plot=${encodeURIComponent(number)}`)
export const selectionLink = (numbers: string[]) => widgetUrl(`set=${numbers.map(encodeURIComponent).join(",")}`)
