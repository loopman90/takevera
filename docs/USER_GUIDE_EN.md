# Takevera – beginner's guide

This guide walks through the main workflows. Projects are stored locally on your Mac by default, and Takevera saves your work automatically. An internet connection is only needed for features that deliberately use an online service, such as a confirmed weather lookup or an AI service you configure.

The packaged Mac app requires macOS 13 Ventura or newer. The ARM64 build was made on this Mac; the Intel build was packaged but has not been interactively validated on Intel hardware.


## Open a Mac build

The 0.1.2 beta is available from the official GitHub release. The Mac build uses an ad-hoc signature without Apple Developer ID signing or notarization. An ad-hoc signature does not establish the developer’s identity; macOS may block the first launch.

Obtain the release from the official project source and check that it is the expected, unmodified file. Try opening the app first. If macOS blocks it, **System Settings → Privacy & Security** may offer **Open Anyway**. Follow [Apple’s instructions and safety guidance](https://support.apple.com/en-us/102445). Do not open an app reported as malware, damaged or modified. Wording and availability depend on the macOS version and device management.

## Windows and Linux

The 0.1.2 beta includes an unsigned portable Windows x64 test package. The Windows-built package passed an automated startup check on a Windows runner; interactive validation is still needed. It is not an installer. Extract the whole ZIP and open Takevera.exe; Windows may warn or block it. A portable Linux x64 test archive passed an automated startup check on a Linux runner; interactive validation is still needed: extract the full tar.gz file and run `./takevera` in the extracted folder. A graphical desktop and a working Chromium sandbox are required; this is not an installer or AppImage. Local OCR for scanned PDFs is available on macOS. Saving API keys and collaboration tokens on Linux requires a supported secure secret store.

## Find help

Choose **? Help me** at the top of the app for guidance about the current screen. Search for a topic, open a walkthrough or choose **Full user guide**. You can also open the getting-started guide and glossary from there. Help works offline.

Takevera uses the system language on first launch when supported, otherwise English. Change the interface language in **Settings**. Script language is selected separately for each project.

## Connect AI through an API

1. Open **Settings → AI configuration**. Choose **Claude (Anthropic)**, **Gemini (Google)** or **Grok (xAI)**. Choose an OpenAI-compatible endpoint for another provider, or a local model when you run your own model server.
2. For Claude, Gemini and Grok, Takevera fills in the official API address and an example model. Check and change the model name to one available to your account. For Claude, enter the optional workspace ID if your key is not scoped to a workspace. For another compatible provider, enter its chat-completions API base URL and exact model name. For example, a base URL ending in `/v1` becomes `/v1/chat/completions`; an endpoint already ending in `/chat/completions` is left as is. Remote endpoints require HTTPS; HTTP is allowed only for localhost. Enter the final API address: redirects are not followed for security reasons.
3. Enter an API key if required. A local server may not need one. Save the AI settings. Secure storage must be available to save a key. When changing provider or endpoint, enter a new key or explicitly remove the saved one; keys are not carried to another provider automatically. A chat subscription does not necessarily include API access; check your provider’s terms and credits.
4. Open a project and choose the AI assistant in **Script** or **Production**. Select a task, review the context preview and confirm. The selected information is sent to the configured endpoint. With an external provider it leaves your computer; check their terms and possible charges.
5. Review the response. Suggestions do not automatically change the script. If the request fails, check the endpoint, model name, key and available credits; also check that a local server is running.

## 1. Start a project

1. Choose **New project** and enter a title.
2. Choose the production type and script language. The interface language is selected separately in **Settings**. It also controls common file, storage, and connection error messages. You can hide or show the editor’s writing tip and reopen the introduction there. Drag the divider beside the navigation sidebar to resize it; Takevera remembers the width. You can also focus the divider and use the arrow, Home, and End keys.
3. Add a logline, synopsis, and creators if useful.
4. A new installation starts without projects. Create a project or import an existing one.

The home screen shows your projects, scene counts, task progress, and last-changed time. Use search to find a project.

## 2. Write and organize scenes

Open **Script** and create a scene. Enter its heading, action, character, and dialogue. Character/speaker and location fields suggest names already in the project; you can also type any value. Use script elements for stage directions, music, sound, or custom cues. The selected production type changes the editor and print layout.

- Add, duplicate, and drag scenes in the scene list.
- Use cards for an overview or continuous-script view for reading.
- Search and replace text across the project script.
- The editor saves automatically. Word count, estimated pages, and running time appear below the scene.
- Lock or approve scenes when they should not be changed inadvertently.
- Add scene comments. Selected text can be anchored to a comment.

Keyboard shortcuts **⌘/Ctrl+N**, **⌘/Ctrl+S**, and **⌘/Ctrl+F** create a project, save, and search. The scene list supports the arrow keys and Home/End. Open **Glossary** to look up a production or script term.

## 3. Manage the project bible and breakdown

Open **Project bible** to manage characters, locations, timeline, world rules, key objects, and style or terminology rules. Under **Timeline events**, add dated moments with a description, notes, and an optional scene link. Use the arrows to reorder events; that order also appears in AI continuity context and as a list in the production book. Character entries can include history, traits, relationships, and development. Location entries can store address, access, parking, travel time, contact, safety, and sound rules. Character and location entries link to matching scenes; click a scene to open it in **Script**.

Choose **Scan script references** to propose characters, locations, and explicit music or sound cues. New suggestions are marked for review: confirm or edit them before using them as project information.

Open **Breakdown** to track props, costumes, equipment, sound, makeup, effects, and transport per scene. Assign an owner and update the status. Continuity, lighting, and sound notes stay attached to the scene.

## 4. Build a shot list and equipment plan

Open **Production → Shotlist** and add shots. Link each shot to a scene. Shot type/framing, movement, lens, sound, and lighting fields offer suggestions. Click a field or press the down arrow to open its menu. Choose a suggestion or enter your own value; custom values remain allowed and become project suggestions for later use.

In the equipment list, filter by shoot day and status. The day filter includes general items and equipment linked to that day's scenes or shots. Notices highlight items still marked **Needed**, zero quantities, and possible duplicate names. Matching names may describe separate items; this is not a determination of a scheduling overlap.

Choose **Save preset** on a filled shot, equipment item, or lighting fixture and give it a name. Select it later in the same project and choose **Add preset** to create a new item. Scene, shot, and day links, images, and equipment status are not copied; review them on the new item. Presets are stored and shared with the project. Deleting a preset leaves existing items intact.

Add a reference image to a shot with caption and source/rights details. Locking a shoot day protects its assigned shot list until you unlock the day.

Open **Equipment list** to track items, categories, quantities, owners, and statuses. Assign equipment to scenes or shots. Unassigned items count as general production needs. Update equipment status from the call sheet while on set.

## 5. Plan shoot days

Open **Production → Day overview**. Add shoot days, set date, call, wrap, and address, and assign scenes. Reorder scenes with the arrows. Location grouping is a suggestion; check availability, travel time, and feasibility yourself.

Use **Suggest schedule** to create a draft. The planner asks for a shoot-time estimate per scene, a default travel time between locations, an optional break, and a preparation buffer. A numeric estimate in minutes saved on the destination location in the project bible overrides the default for that move; fractional minutes are rounded. Enter the default only for moves without their own estimate; leave it blank if every move has a specific estimate. It starts at call time and warns about overlaps, tight wrap, missing information, and unknown or unavailable cast, crew, and location availability. Review and adjust the suggestion before sharing it.

Set availability in the **Project bible**: choose a shoot day and mark each cast/crew member and project location available, unavailable, or unknown. You can also keep cast/crew notes and choose per person whether they appear on the call sheet. The day overview uses these values for warnings.

Add practical details such as catering, weather, daylight, safety plan, emergency contact, hospital, lighting, and sound. Record sunrise, sunset, or golden hour in the daylight field. Weather can also be entered manually. You can also fetch a forecast after confirmation; the app shows sunrise, sunset, and daylight duration as astronomical estimates with the source and retrieval time. Manual notes remain intact.

## 6. Use the call sheet on set

Open **Production → Call sheet** and choose a shoot day. The call sheet gathers scenes, schedule, cast/crew, day-relevant equipment, and production tasks. Update task and equipment statuses right there; changes are saved to the project.

Locations used by the assigned scenes show project-bible details such as address, access, parking, travel time, safety, and sound rules. Location contacts, phone numbers, and other contact details appear only when the contact-details switch is enabled. Review the call sheet before printing or sharing it. Compact on-set mode provides larger text, search, and shoot-day switching.

## 7. Lighting, sound, and image references

Open the **Lighting** and **Sound** tabs to record setups per scene or shot. Lighting supports fixtures, positions, modifiers, power needs, and safety notes. Sound supports microphone, placement, recorder, recording format, ambience, wild tracks, and risks.

Attach PNG, JPEG, or WebP references to scenes, shots, lighting, and sound. Copy images into project storage or link to their original location. Add captions, source, creator, date, usage rights, and notes where needed. Takevera flags linked files that are missing.

In the lighting plan, use a lighting reference as a floor plan or mood image. Click the image to place a fixture marker. Drag markers, move them with the arrow keys, and enter a label, fixture, and notes. Markers also appear in printouts.

## 8. Moodboards, storyboards, tasks, and budget

Open **Boards** to create multiple moodboards and arrange images, color blocks, text, and links. Storyboard cards can link to scenes and shots. Framing, camera movement, and sound use the same suggestion lists as the shot list; choose a suggestion or type your own. Duplicate cards and use the move controls to organize them.

Shortlists can contain both script characters and actual cast/crew members, as well as scenes, shots, locations, and equipment. Their order is retained in the production book.

Open **Tasks** to manage owners, due dates, and statuses. Task status remains correct when you change the interface language. Common production tasks and previously used task names and owners appear as suggestions; you can still type new values. Equipment and breakdown fields also suggest common gear and previously entered values. Assign each task to one shoot day or all days; the call sheet shows tasks for its selected day. If you remove a shoot day, its tasks are preserved and assigned to all days. Shots from that day move to the next day, or to the previous day when removing the last day. The home screen calculates progress from completed tasks. Use **Budget** to track estimates, actuals, categories, owners, and currency. Category and owner suggestions include common and previously used values, and you can type custom values.

## 9. Revisions, printing, and backups

Save a script revision with a date, version number, and note. Compare a revision with the current text or choose two saved revisions to compare them with each other. You can restore a revision. With real-time collaboration enabled, the activity list records who saved a change, when it happened, which scene changed, and which project area was updated. It retains up to 1,000 events and reports when older entries are removed. For a change to one scene, when the scene count and order stay the same, the activity list keeps a bounded recovery point for that scene’s script/revision fields. Choose **Restore script before this change** to restore those fields; comments and images are retained. It keeps up to 20 recovery points, 1 MiB combined, with a 128 KiB limit per point. Oversized edits, scene moves, and edits to multiple scenes remain activity-only; save a named revision for those. When an update from another collaborator arrives, session undo/redo history is reset with a notice so an old snapshot cannot overwrite newer content. Revision pages can have a color; enable background graphics in the print dialog to retain that color in a PDF.

From **Production**, print or save as PDF the complete book, active shoot day, call sheet, shot list, lighting plan, sound plan, cast/crew roster, and equipment list. Adjust the project template if needed and use **Manage export templates** to save your own templates. Add custom text sections to the book there, then include or hide them per template and move them into order. Review which sections and contact details will be included before final export. Personal phone numbers require both the export switch and per-person consent.

The script workspace can import and export Fountain, FDX, and DOCX, and import PDF text. Before importing, review the detected scene headings and script blocks alongside conversion warnings. If an FDX or DOCX file contains Takevera project data, you can restore it as a new project or use only the visible script text. Replacing the current script shows the effects on existing scene links. DOCX export lets you choose between the visible script only and a hidden Takevera project attachment containing production data, comments, and revisions. PDF layout is not retained; common DOCX/FDX formatting and Takevera production metadata have limits (see **Known limits** and the README). Use project export for JSON interchange, or export a full project folder when you also need the image assets. For FDX, you can optionally export a project sidecar to retain extra Takevera project data.

New installations store projects in `Documents/Takevera`. An existing installation keeps using `Documents/ScriptStudio` while it contains projects; use **Settings → Move projects…** to copy them to a `Takevera` folder. Project management and **Settings → Backups** provide local snapshots and recovery points. Compare any two valid snapshots or recovery points to see which script fields changed. Corrupt backups cannot be compared. If a project file is missing or damaged, the home screen offers the latest valid backup for recovery. The damaged original is kept as a separate copy and can be deleted in the backup manager. If no valid backup exists, the home screen says so without changing project files. Use **Settings → Move projects…** to copy project storage to another folder. You can also export a project as JSON or as a full project folder with assets. Keep the manifest and `assets` folder together when moving a folder backup. Deleting a project also deletes its associated local files and backups.

### Update Takevera safely

1. Before a major update, export each important project with **Export full project folder**. Keep the `.takevera` folder on a separate drive or in another location, with `takevera-project.json` and `assets/` together.
2. Quit Takevera completely before replacing the app. Updating only the app leaves your project files in their storage folder.
3. Choose the installer for your Mac, replace Takevera in **Applications**, and launch the new version.
4. Check that your projects and images open. If a project is missing or damaged, use **Import full project backup** or **Backups** to restore it.

Takevera does not update automatically. Review the release information before installing a new version. Local repository builds use an ad-hoc signature without a Developer ID and are not notarized, so macOS may show a security warning.

## 10. Optional AI and collaboration

AI is separate from local writing and production features. In **Settings**, configure a compatible API endpoint or local model server. Open the assistant from **Script** for writing tasks or from **Production** for a breakdown of existing scene data. Review the context preview and confirm the request; for translation, enter the target language explicitly. AI suggestions do not replace your text automatically. You install and run a local model yourself.

Shared-folder sync is manual and asks for confirmation before writing data. When there is a conflict, choose which copy to keep; make an independent backup first. Real-time collaboration requires a self-hosted server and invitation. The server can be used locally; you arrange external hosting, TLS, and domain yourself. Read the privacy and limits in the README before sharing production data.

## Known limits

PDF import extracts selectable text; optional local OCR can recognize scanned pages on macOS. PDF layout and original pagination are not preserved. DOCX and FDX support common screenplay structures, but complex formatting and some revision data may be lost. Optional project sidecars can preserve additional metadata in Takevera DOCX/FDX exchanges. Celtx import is unavailable. The app has not been interactively validated on Windows or Linux. Local macOS installers use an ad-hoc signature without a Developer ID and are not notarized.


## Individual equipment units and bookings

Open **Production → Equipment list** and expand **Individual units and bookings** on an item. Add each physical unit with a name or identifier and optionally a unique serial number. Add bookings with start and end dates and times and a purpose. Warnings identify overlapping, incomplete or invalid bookings. Matching serial numbers identify the same unit even on different rows. Enter every booking: quantities and scene or shot links do not create them automatically. Booking times use this device's local time.

## Check planning and exchange files

The day overview displays recorded availability issues, timeline conflicts, and a reminder to check preparation time. The schedule suggestion allows preparation time before each scene. Check that all people and locations have been entered; absence of a warning is not confirmation. The script import preview summarises recognised content and limitations before replacement. Compare the result with the original. After FDX and DOCX export Takevera reads back and checks the written file; DOCX required document parts are also checked. Review the appearance in the destination application as well.

### Backup status and restore

Open a project and click its backup status at the top, or choose **Settings → Backup and restore**. The panel shows local restore points and the last full project folder export recorded on this device. A reminder appears if no full export is recorded, the last export was incomplete, or the last complete export is at least seven days old. Choose **Make a full project copy** and keep the whole folder on another drive or location. The app cannot check whether the copy still exists or includes later changes; check that you can import it. An export with missing images is shown as incomplete.

Choose **Choose and restore an earlier version** to review local restore points and confirm the version. The current project is kept as a restore point first. Disconnect live collaboration before opening local restore points. **Import full project backup** imports a full folder as a new project; the original is not replaced. Local restore points share the project storage and do not protect against loss of the whole drive.

### Sharing a call sheet and safety briefing

Under **Production → Day overview**, record safety responsibilities, communication, evacuation and any assistance needed. Enter the date the briefing was reviewed and keep it current. In **Call sheet**, the pre-sharing check highlights important missing information; also check the accuracy and currency yourself. The nearest hospital appears even when contact details are excluded. The contact and emergency details option controls whether those details are included; personal phone numbers are included only when selected for the person. Choose **Print call sheet** and save as PDF in the print dialog to share the day's information. Check the PDF before sending it.

The day overview starts with the key details and a link to the call sheet. Open the schedule, safety and scenes sections to edit them; each section shows a summary when collapsed. Under **Production book and reports**, choose the document first to see its relevant options. The save status appears at the top. If saving fails, the message remains visible and you can choose **Retry save**.

### Import, day bundle and project health

Before replacing a script, Takevera compares scene headings and counts affected day, shot, equipment, shortlist, storyboard and timeline links. Matching headings are not linked automatically. A full local recovery point is created first; a script revision alone does not restore production links. If needed, restore through **Backup and recovery**. Review breakdowns and relink production records after import.

Changing a scene's day assignment reports the location, character cue, shots and equipment to review. Check people, timing and bookings yourself; these do not move automatically. Scheduling suggestions do not optimize cast or setup time.

Choose the day and contact option on the call sheet and select **Print call sheet**. The review describes the contents and suggested filename; choose **Save as PDF** in the system dialog, review the PDF and share it yourself. The backup button opens project health and lets you practice recovery by importing a full backup as a new project. Only the selected backup is actually checked.

### Writing and production

Use Tab to move between fields and Cmd/Ctrl+Enter to move to the next text block. Optionally enable Enter mode: in action or dialogue press Enter on a blank final line; Shift+Enter still inserts a new line. At the end this shortcut adds a character and dialogue block. Select script text and use **Selection for breakdown** to add, for example, a prop. In Breakdown you can return to its source; changed source text is flagged for review.

**Lock scene numbers** keeps existing numbers when scenes are reordered; new scenes receive a new number. FDX preserves these numbers where present. Replacing the script disables locked numbering. **Page numbers are not locked:** check them again for each production version.

Choose a saved revision under **Compare print with revision** to mark new or changed current lines with asterisks. You can print only marked pages. Removed text is not shown, and reflow can mark additional lines; also use the revision comparison. This is not locked production pagination.

Add **Dual dialogue** under script elements for two columns. FDX preserves the supported two-speaker structure; check the result in the other application. Fountain and DOCX output both speakers sequentially and do not preserve the columns. Revision marks inside FDX dual dialogue are not preserved. **Production book and reports** includes scenes by location, scenes by character and dialogue by character. These reports use entered locations and character cues; check that they are complete.

## Story development and feedback

Use Story board to create and reorder beats and link them to scenes; reordering beats does not reorder the script. Check links after replacing a script. In the script editor, save alternatives for the first dialogue or the whole scene’s script text. Applying a scene version first saves the current text; production data and comments stay in place. Save the current dialogue yourself before applying a dialogue alternative. These alternatives live in the Takevera project and are not normally exchanged in Fountain, FDX or DOCX.

Script history lists named revisions and available local recovery points, and can restore a single text field after creating a recovery point. It is not a complete keystroke history. Script checks provide suggestions, not a guarantee. Read aloud uses available local system voices for the current scene; dual dialogue is read sequentially.

For an offline feedback round, export the HTML file from the script and share it yourself. It includes all scene script text, but not production notes, contacts or images. The reader opens it locally, writes comments and saves a response file to return to you. Import the response and review the matched count before adding comments. No file is sent automatically.

Production page locking, A-pages and omitted pages are not supported; print pagination is recalculated.
