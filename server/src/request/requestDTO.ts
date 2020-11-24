export class SaveDTO {
    path: string;
    content: string;
}

export class ConnnectDTO {
    url: string;
    port: number;
    username: string;
    password: string;
    type: string;
}

export class ExecuteDTO extends ConnnectDTO{
    sql: string;
}

export class NewVersionDTO extends ConnnectDTO{
    name: string;
    mark: string;
    version: string;
}