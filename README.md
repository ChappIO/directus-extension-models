# Directus extension: Generate TypeScript Types Models

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

## Note: Geometry Support

I am still working on support for the geometry types.

## Note: Custom Types Support

I have not added support for custom types. If you would like your custom type to be supported, create an issue.
