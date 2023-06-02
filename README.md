# Directus extension: TypeScript Models

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

Then, run the `models` command to export your model to disk: `directus models snapshot <targetFolder>`.

Example:

```bash
directus models snapshot ./src/model
```