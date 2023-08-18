# Directus extension: Generate TypeScript Types Models
[![directus-extension-models](https://npmbadge.com/npm/directus-extension-models)](https://www.npmjs.com/package/directus-extension-models)

This extension lets you generate typescript types from your Schema, allowing you to more easily develop your custom extensions with type checking.

## Usage

To install the extension, simply install the package into your project:

```bash
npm install directus-extension-models
```

or

```bash
yarn add directus-extension-models
```

Then, run the `models snapshot` command to export your model to disk: `directus models snapshot <taretFile>`.

Example:

```bash
directus models snapshot ./path/to/target/model.d.ts
```

> :thumbsup: **Global Types**: You can specify the --global option while taking a snapshot to generate a global
> type definition file giving you types without having to import them.

### Usage in @directus/sdk

You can now create your directus sdk using these generated models:

```typescript
import {createDirectus, readItem, readSingleton, rest} from "@directus/sdk";
import {Collections} from "./models";

const directus = createDirectus<Collections>(
    'https://my.directus.example.com'
)
    .with(rest());

(async () => {
    const settings = await directus.request(
        readSingleton('directus_settings')
    );
    console.log(`Welcome to ${settings.project_name}`);

    const user = await directus.request(
        readItem('directus_users', 'user-id-in-here')
    );

    console.log(`Hi ${user.first_name}!`);
})();
```

### Usage in Directus extensions

```typescript
import {defineEndpoint} from '@directus/extensions-sdk';
import type {CollectionName, ItemIn} from "../models";
import type {ItemsService} from "@directus/api/dist/services";

export default defineEndpoint((router, {services}) => {
    /**
     * You probably want to move this utility to a place more suitable
     * for your extension
     */
    function items<C extends CollectionName>(collectionName: C): ItemsService<ItemIn<C>> {
        return new services.ItemsService(collectionName);
    }

    router.get('/', async (_req, res) => {
        const settings = await items('directus_settings')
            .readSingleton({});

        res.json({
            name: settings.project_name
        });
    });
});
```
