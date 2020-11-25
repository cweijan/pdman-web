import { get } from './ajax'

const systemInfo = async () => {
    return await get("/api/info");
}

export default {
    systemInfo
}