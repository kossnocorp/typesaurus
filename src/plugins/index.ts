import { Typesaurus } from "..";
import { TypesaurusPlugins as Plugins } from "../types/plugins";

export function createPlugin<Plugin extends Plugins.Plugin>(
  plugin: Plugin,
): Plugin {}
