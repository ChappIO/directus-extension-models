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

## Note: Geometry Support

I am still working on support for the geometry types.

## Note: Custom Types Support

I have not added support for custom types. If you would like your custom type to be supported, create an issue.
