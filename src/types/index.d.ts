export type ObjectType = Record<string, any>;
export type FindAccountType<T> = Omit<T, 'created_at' | 'updated_at'>;
