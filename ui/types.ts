export interface FieldInfo {
    path: string;
    type: string;
    instance: string;
    required: boolean;
    defaultValue?: unknown;
    ref?: string;
    enumValues?: string[];
    min?: number;
    max?: number;
    match?: string;
    options?: unknown;
}

export interface ModelMeta {
    total: number;
    pages: number;
    page: number;
    limit: number;
}

export interface MongooseDoc {
    _id: string;
    __v?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface SortState {
    field: string;
    order: 1 | -1;
}

export interface ModelResponse {
    docs: MongooseDoc[];
    meta: ModelMeta;
    fields: FieldInfo[];
}
