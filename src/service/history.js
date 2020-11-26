import { get, set } from 'idb-keyval';


const readH = () => {
    return []
}

const writeH = (content) => {

}
const writeNew = (content) => {
    if (typeof content == 'string') {
        localStorage.setItem("history", content)
    } else {
        localStorage.setItem("history", JSON.stringify(content))
    }
}

const readNew = async () => {
    const history = await get('history');
    return history ? history : []
}

const storeHistory = async (fileHandler, projectName) => {

    const histories = await get('history') || []

    if (fileHandler) {
        histories.push({ type: 'file', handler: fileHandler, name: fileHandler.name })
    } else {
        histories.push({ type: 'create', name: projectName })
    }

    set('history', histories)

}

export default {
    readH, writeH, readNew, writeNew, store: storeHistory
}