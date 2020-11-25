import { string } from "prop-types";

const readH = () => {
    const history = localStorage.getItem('history')
    console.log(history ? history.split(",") : [])
    return history ? history.split(",") : [];

}

const writeH = (content) => {
    if (typeof content == 'string') {
        localStorage.setItem("history", content)
    } else {
        localStorage.setItem("history", JSON.stringify(content))
    }
}

export default {
    readH, writeH
}