const readH = () => {
    const history = localStorage.getItem('history')
    console.log(history ? history.split(",") : [])
    return history ? history.split(",") : [];
    
}

const writeH = (content) => {
    localStorage.setItem("history", content)
}

export default {
    readH, writeH
}