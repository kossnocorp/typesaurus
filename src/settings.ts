export type TypesaurusSettings = {
  undefinedToNull: boolean;
}

export let Settings: TypesaurusSettings = {
  undefinedToNull: true
}

export function typesaurusSettings(settings: Partial<TypesaurusSettings>): void {
  Settings = {...Settings, ...settings};
}