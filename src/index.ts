import {defineHook} from '@directus/extensions-sdk';
import pluralize from 'pluralize';
import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";
import type {Command} from "commander";
import type {CollectionsOverview, FieldOverview} from "@directus/shared/types";

type Collection = CollectionsOverview[''];

function upperCamelCase(value: string) {
    return value.split('_')
        .map(part => part[0].toUpperCase() + part.substring(1).toLowerCase())
        .join('');
}

function className(collection: Collection): string {
    const plural = collection.collection;
    const singular = pluralize.singular(plural);
    return upperCamelCase(singular);
}

function fieldTypeToJsType(field: FieldOverview): string | [string, string] {
    switch (field.type) {
        case"boolean":
            return "boolean";
        case "integer":
            return "number";
        case "dateTime":
        case"date":
        case "time":
        case "timestamp":
            // TODO: Validate this
            return "string";
        case "text":
        case "string":
        case "uuid":
        case "hash":
            return 'string';
        case "json":
            return "any";
        case "float":
        case "decimal":
        case "bigInteger":
        case "alias":
        case "binary":
        case "csv":
        case "geometry":
        case "geometry.Point":
        case "geometry.LineString":
        case "geometry.Polygon":
        case "geometry.MultiPoint":
        case "geometry.MultiLineString":
        case "geometry.MultiPolygon":
        case "unknown":
        default:
            return 'unknown';
    }
}

function generateModel(collection: Collection): string {
    let imports = [];
    let source = `export interface ${className(collection)} {\n`;

    Object.values(collection.fields).forEach(field => {
        let type = fieldTypeToJsType(field);
        if (Array.isArray(type)) {
            if (!imports.includes(type[1])) {
                imports.push(type[1]);
            }
            type = type[0];
        }
        source += `
  /**
   * ${field.note || 'No description.'}
   *
   * Type in directus: ${field.type}
   */
   ${field.field}: ${type};\n`
    });

    source += '}\n'

    let importsSource = imports.map(importLine => `${importLine}\n`).join();
    if (imports) {
        importsSource += "\n";
    }

    return `${importsSource}${source}`
}

function generateIndex(collections: CollectionsOverview): string {
    let source = ``;
    Object.values(collections).map((collection: Collection) => {
        source += `import { ${className(collection)} } from "./${className(collection)}";\n`
    });

    source += '\nexport interface Collections {';
    Object.values(collections).forEach((collection: Collection) => {
        source += `  ${collection.collection}: ${className(collection)};\n`
    });
    source += '}\n';
    return source;
}

export default defineHook(async ({init}, {services, getSchema, database, logger}) => {
    init('cli.after', ({program}: any) => {

        const modelTypesCommand: Command = program.command('models')
            .description('Export the currently connected database to .d.ts files');

        modelTypesCommand
            .command('snapshot')
            .description('Export the currently connected database to .d.ts files into the <directory>')
            .arguments('<directory>')
            .action(async function (targetDirectory: string) {
                const schema = await getSchema();
                const collections = schema.collections;

                const collectionsService = new services.ItemsService('directus_activity', {
                    knex: database,
                    schema
                });
                const data = await collectionsService.readByQuery({});
                console.log(data);

                await mkdir(targetDirectory, {
                    recursive: true,
                });

                // Generate all classes
                for (let collection of Object.values(collections)) {
                    const outFile = join(targetDirectory, className(collection) + '.d.ts');
                    await writeFile(outFile, generateModel(collection))
                }

                // Generate the index
                await writeFile(join(targetDirectory, 'index.d.ts'), generateIndex(collections));
                process.exit(0);
            });
    });
});