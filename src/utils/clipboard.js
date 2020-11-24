//TODO  返回的是primise
const readText = () => {
    return navigator.clipboard.read();
}

const writeText = (text) => {
    navigator.clipboard.writeText(text)
}

export default {
    readText,
    writeText
}