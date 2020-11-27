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

    // 创建历史记录
    let history;
    if (fileHandler) {
        history = { type: 'file', handler: fileHandler, name: fileHandler.name }
    } else {
        history = { type: 'create', name: projectName }
    }

    const histories = await get('history') || []
    // 如果历史记录存在, 则进行更新
    for (let index = 0; index < histories.length; index++) {
        const oldHistory = histories[index];
        if (oldHistory.name == history.name) {
            histories[index] = history;
            set('history', histories)
            return;
        }
    }


    // 如果历史记录不存在, push一条
    histories.push(history)
    set('history', histories)

}

export default {
    readH, writeH, readNew, writeNew, store: storeHistory
}