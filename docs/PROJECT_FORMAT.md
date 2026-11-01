# Takevera project format

Takevera projects are UTF-8 JSON. The application uses the same project object for local storage, collaboration snapshots, and project interchange. Fields are extensible: the app preserves unknown project properties when it opens and saves a project, but only documented fields have defined application behavior.

## Core project object

A permissive JSON Schema for external tools is available at [`project-format.schema.json`](project-format.schema.json). It validates core required fields and common field types; it intentionally permits additional project and scene properties.

A project object must contain:

```json
{
  "id": "project-id",
  "title": "Example project",
  "scenes": []
}
```

`id` is a 1–80 character identifier using letters, digits, `_`, or `-`. Takevera normally creates a UUID-like ID. `title` is a string and `scenes` is an array of objects. Common optional top-level properties include:

- Project metadata: `type`, `language`, `sampleType`, `createdAt`, `updatedAt`, `creators`, `logline`, `synopsis`, and `projectNotes`. Timestamps are Unix milliseconds.
- Script and story bible: `scenes`, `characters`, `locations`, `timeline`, `timelineEvents`, `worldRules`, `keyObjects`, and `styleGuide`.
- Production: `shootDays`, `shots`, `shortlists`, `people`, `equipment`, `tasks`, `budget`, `productionReferences`, `storyboard`, `moodboards`, `moodboard`, `lightPlan`, `soundPlan`, and `productionTemplates`.
- History and collaboration: `revisions`, `editLog`, and project- or scene-level comments. Sensitive contact fields may be present; review exports before sharing them. A real-time `editLog` event may include a version-1 `scriptSnapshot` with `sceneId`, `before`, and `after` script/revision fields for a one-scene edit when the scene count and stable scene order are unchanged. `sceneId` refers to `scenes[].editHistoryId`, assigned after the user enables collaboration. Takevera bounds automatic collaboration recovery to 20 snapshots and 1 MiB total, with a 128 KiB per-snapshot limit; oversized events set `scriptSnapshotUnavailable` to `size`, and old snapshots removed to meet the limit increment `editLogSnapshotsPruned`. These snapshots exclude comments and images and can be restored from the activity list. Scene reorderings, additions/removals, and multi-scene edits rely on named script revisions instead.
- Reusable production presets: `productionPresets` is an optional array of `{id, kind, name, values}`. `kind` is `shot`, `lighting`, or `equipment`; `values` contains only reusable text and numeric fields. Scene/day/shot links, image references and equipment status are excluded. Presets belong to the project and travel with project export and real-time collaboration.

Scene objects commonly use `heading`, `act`, `action`, `character`, `dialogue`, `location`, `duration`, `notes`, `elements`, `comments`, `images`, `inventory`, `continuity`, and lighting/sound fields. Script `elements` are ordered objects such as `{ "type": "stageDirection", "text": "..." }`. Project fields are optional unless stated above. Takevera keeps script text and production details in the same scene object so exports and backups can preserve their association.

When present, the `scenes`, `characters`, `people`, `locations`, `shootDays`, `shots`, `shortlists`, `tasks`, `equipment`, `moodboard`, `storyboard`, `timelineEvents`, `productionTemplates`, `productionPresets`, and `customBookSections` fields must be arrays of objects. Scene-level `elements`, `comments`, `inventory`, and `images` fields follow the same rule. Unknown fields are preserved. Local project loading and imports reject malformed known collections so they cannot crash the editor; omitted optional collections remain valid and are initialized by the app.

`productionTemplates` contains named export templates with ordered `sections` string keys. `customBookSections` contains project-wide user-authored production-book sections as `{ "id": "...", "title": "...", "content": "..." }`. Templates include, omit, and order custom sections with keys in the form `custom:<id>`. Custom section text is escaped and printed as text, not HTML.

Structured timeline events use `{ "when": "", "title": "...", "scene": 0, "notes": "..." }`. `when` is a local `datetime-local` string or an empty string. `scene` is a zero-based scene index or an empty string when unlinked. Other production links also commonly refer to scenes or shots by zero-based array index. When editing JSON outside Takevera, update those indices when reordering or deleting scenes. The application remaps its known links when the user makes those changes in the app.

## Interchange JSON envelope

The regular project export wraps a project with its image assets:

```json
{
  "format": "scriptstudio-project",
  "formatVersion": 1,
  "project": { "id": "...", "title": "...", "scenes": [] },
  "assets": [
    { "id": "asset-1", "mimeType": "image/png", "dataBase64": "..." }
  ]
}
```

When an image is bundled, the corresponding `project` image reference uses `scriptstudio-asset://asset-1` and `storageMode: "copied"`. Supported MIME types are PNG, JPEG, and WebP. The importer verifies image content, writes the assets to local project storage, and assigns the imported project a new local ID. Missing or unsupported linked images are reported and are not silently replaced.

A bare project object with the three required fields can also be imported. The versioned envelope is preferred for interchange because it can carry assets. Takevera currently accepts envelope version 1.

## Full project folder backup

A `.takevera` backup is a directory containing `takevera-project.json` and an `assets/` directory. Its manifest has this shape:

```json
{
  "format": "takevera-project-folder",
  "formatVersion": 1,
  "project": { "id": "...", "title": "...", "scenes": [] },
  "assets": [
    {
      "id": "asset-1",
      "mimeType": "image/png",
      "path": "assets/asset-1.png",
      "size": 1234,
      "sha256": "..."
    }
  ],
  "unbundledImages": 0
}
```

The matching image URL in `project` is `takevera-asset://asset-1`. Keep the manifest and assets together. Import checks each asset's path, MIME type, size, file signature, and SHA-256 hash before copying it into local storage; it assigns a new project ID. Folder backups support up to 100 images of 15 MB each.

## Compatibility and migrations

Local project JSON has no separate schema-version field. The interchange and folder wrappers each have their own `formatVersion`, currently `1`. The app can read older projects that use `storyTimeline`; when opening one, it uses that text to initialize `timeline`. The original legacy property may remain in the project. No automatic migration framework is promised for future versions; keep a full project backup before major upgrades. A format version the app does not support is rejected rather than guessed.
