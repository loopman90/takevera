const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

test('offline help includes current production workflow topics in both languages', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/help-content.js'), 'utf8'), context);
  for (const [language, titles] of Object.entries({
    nl: ['Projectnavigatie kiezen','Productieoverzicht en planningscontroles','Scène verplaatsen en tijdvak instellen','Call sheet uitgeven en delen','Breakdownitems koppelen en rapporteren','Verhaalstructuur en outline','Samenwerking uitnodiging en herstel'],
    en: ['Choose project navigation','Production overview and planning checks','Move a scene and set a time window','Issue and share a call sheet','Link and report breakdown items','Story structure and outline','Collaboration invitation and recovery']
  })) {
    const help = context.window.takeveraHelp[language];
    for (const title of titles) {
      const entry = help.entries.find(item => item.title === title);
      assert.ok(entry && entry.tags && entry.steps.length, `${language}: ${title}`);
    }
    for (const section of ['story','script','breakdown','bible','production','boards','settings','project-start']) assert.ok(help.sections[section]);
    for (const tab of ['day','call','shotlist','equipment','light','sound','tasks','budget','shortlist','wrap']) assert.ok(help.production[tab]);
  }
});
