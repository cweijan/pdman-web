//TODO  返回的是primise
const readText = () => {
    return navigator.clipboard.readText();
}

const writeText = (text) => {
    navigator.clipboard.writeText(text)
}

export default {
    readText,
    writeText
}