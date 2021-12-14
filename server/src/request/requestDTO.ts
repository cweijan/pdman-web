export class SaveDTO {
    path: string;
    content: string;
}

export class ConnnectDTO {
    url: string;
    port: number;
    username: string;
    database: string;
    password: string;
    type: string;
}

export class ExecuteDTO extends ConnnectDTO{
    sql: string;
}

export class NewVersionDTO extends ExecuteDTO{
    cmd: string;
    version: string;
    message: string;
}

export class NewProjectVersion{
    projectId: string;
    version: string;
    content: string;
    remark: string;
}