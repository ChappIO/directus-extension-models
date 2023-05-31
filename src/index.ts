import {defineHook} from '@directus/extensions-sdk';
import pluralize from 'pluralize';
import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";

function generateModel(className: string): string {
    return `
export interface ${className} {
}`
}

function upperCamelCase(value: string) {
    return value.split('_')
        .map(part => part[0].toUpperCase() + part.substring(1).toLowerCase())
        .join('');
}

export default defineHook(async ({init}, {services, getSchema, database, logger}) => {
    init('cli.after', ({program}: any) => {

        const modelTypesCommand = program.command('models')
            .description('Export the currently connected database to .d.ts files');
        modelTypesCommand
            .command('snapshot')
            .description('Export the currently connected database to .d.ts files')
            .requiredOption('-o, --outdir <directory>', 'The target output directory')
            .action(async function (opts: any) {
                const schema = await getSchema();
                const collections = schema.collections;

                await mkdir(opts.outdir, {
                    recursive: true,
                });

                // Generate all classes
                for (let collection of Object.values(collections)) {
                    const plural = collection.collection;
                    const singular = pluralize.singular(plural);
                    const className = upperCamelCase(singular);
                    const outFile = join(opts.outdir, className + '.d.ts');
                    const classSource = generateModel(className);
                    await writeFile(outFile, classSource)
                }

                // Generate the index
                let indexSource = `export interface Collections {`;
                for (let collection of Object.values(collections)) {
                    const plural = collection.collection;
                    const singular = pluralize.singular(plural);
                    const className = upperCamelCase(singular);
                    indexSource += `\n    ${plural}: ${className};`
                }
                indexSource += '\n}\n';
                await writeFile(join(opts.outdir, 'index.d.ts'), indexSource)
                process.exit(0);
            });
    });
});