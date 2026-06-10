export const en = {
  // GalaxyPanel
  "galaxy.label": "Galaxies",
  "galaxy.new": "+ New Galaxy",
  "galaxy.rename": "Rename",
  "galaxy.delete": "Delete",
  "galaxy.promptNewName": "Name your new galaxy",
  "galaxy.promptRename": "Rename this galaxy",
  "galaxy.confirmDelete": "Delete galaxy \"{name}\" and everything in it? This cannot be undone.",
  "galaxy.cannotDeleteLast": "You must keep at least one galaxy.",
  // ControlPanel
  "control.newNode": "+ New Node",
  "control.relayout": "Re-layout",
  "control.footer": "{count} stars visible · drag to rotate · scroll to zoom · click to inspect",
  // SearchPanel
  "search.label": "Search memories",
  "search.placeholder": "Search by title or content…",
  "search.empty": "No matching stars",
  // TypeFilterPanel
  "typeFilter.label": "Types · lit means visible",
  // TagFilterPanel
  "tagFilter.label": "Constellations · none = all",
  // DetailPanel
  "detail.close": "Close details",
  "detail.edit": "Edit",
  "detail.tags": "Constellations",
  "detail.connected": "Connected stars ({count})",
  "detail.relations": "Relations",
  "detail.selectTarget": "Select a target node…",
  "detail.alertSelectTarget": "Please select a target node",
  "detail.addRelation": "Add relation",
  "detail.deleteRelation": "Delete relation",
  "detail.confirmDeleteNode": "Delete \"{title}\"? This will also remove all its connections.",
  "detail.deleteNode": "Delete node",
  // GraphIOPanel
  "io.importFailed": "Import failed",
  "io.confirmReset": "Reset to the demo data?",
  "io.dataLabel": "Data",
  "io.exportJson": "Export JSON",
  "io.importJson": "Import JSON",
  "io.reset": "Load demo",
  // NodeFormModal
  "form.titleRequired": "Title cannot be empty",
  "form.createTitle": "New node",
  "form.editTitle": "Edit node",
  "form.title": "Title",
  "form.type": "Type",
  "form.importance": "Importance",
  "form.tags": "Tags",
  "form.tagsPlaceholder": "Separate with commas, e.g. math, reading",
  "form.content": "Content",
  "form.cancel": "Cancel",
  "form.save": "Save",
  // Stars (importance tooltip)
  "stars.tooltip": "Importance {value}/5",
  // Node type labels
  "type.idea": "Idea",
  "type.note": "Note",
  "type.person": "Person",
  "type.project": "Project",
  "type.book": "Book",
  "type.course": "Course",
  "type.event": "Event",
  "type.concept": "Concept",
  // Edge type labels
  "edge.related": "Related",
  "edge.causes": "Causes",
  "edge.supports": "Supports",
  "edge.contradicts": "Contradicts",
  "edge.source": "Source",
  "edge.similar": "Similar",
  "edge.extends": "Extends",
} as const;

export type TranslationKey = keyof typeof en;
