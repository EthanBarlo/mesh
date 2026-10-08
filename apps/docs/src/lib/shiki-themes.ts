/**
 * "Drafting" code themes: graphite ink for the code itself, the safety-orange
 * accent for keywords, non-photo blue for strings, faint pencil for comments.
 * Kept deliberately small so code reads like the rest of the sheet.
 */

type Palette = {
  background: string;
  foreground: string;
  keyword: string;
  string: string;
  constant: string;
  comment: string;
  punctuation: string;
  entity: string;
  variable: string;
  tag: string;
  attribute: string;
};

function createTheme(name: string, type: 'light' | 'dark', p: Palette) {
  return {
    name,
    type,
    colors: {
      'editor.background': p.background,
      'editor.foreground': p.foreground,
    },
    tokenColors: [
      { settings: { foreground: p.foreground } },
      {
        scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
        settings: { foreground: p.comment, fontStyle: 'italic' },
      },
      {
        scope: [
          'keyword',
          'storage',
          'storage.type',
          'storage.modifier',
          'keyword.control',
          'keyword.operator.new',
          'keyword.operator.expression',
          'keyword.other.use',
          'keyword.other.namespace',
          'variable.language.this',
          'variable.language.special',
        ],
        settings: { foreground: p.keyword },
      },
      {
        scope: [
          'string',
          'string.quoted',
          'string.template',
          'punctuation.definition.string',
          'string.unquoted',
          'markup.inline.raw',
        ],
        settings: { foreground: p.string },
      },
      {
        scope: [
          'constant',
          'constant.numeric',
          'constant.language',
          'constant.character',
          'support.constant',
          'variable.other.constant',
        ],
        settings: { foreground: p.constant },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call',
          'entity.name.type',
          'entity.name.class',
          'support.class',
          'support.type',
          'entity.other.inherited-class',
          'entity.name.namespace',
        ],
        settings: { foreground: p.entity },
      },
      {
        scope: ['variable', 'variable.other', 'variable.parameter', 'meta.definition.variable'],
        settings: { foreground: p.variable },
      },
      {
        scope: ['entity.name.tag', 'meta.tag', 'punctuation.definition.tag', 'support.class.component'],
        settings: { foreground: p.tag },
      },
      {
        scope: ['entity.other.attribute-name'],
        settings: { foreground: p.attribute },
      },
      {
        scope: [
          'punctuation',
          'meta.brace',
          'keyword.operator',
          'punctuation.separator',
          'punctuation.terminator',
          'meta.delimiter',
        ],
        settings: { foreground: p.punctuation },
      },
      {
        scope: ['markup.heading', 'markup.bold'],
        settings: { foreground: p.foreground, fontStyle: 'bold' },
      },
      {
        scope: ['markup.inserted'],
        settings: { foreground: p.string },
      },
      {
        scope: ['markup.deleted'],
        settings: { foreground: p.keyword },
      },
    ],
  };
}

export const draftingLight = createTheme('drafting-light', 'light', {
  background: '#e4e0d7',
  foreground: '#1d1c1a',
  keyword: '#a63a0a',
  string: '#2f5a78',
  constant: '#b2470f',
  comment: '#857f74',
  punctuation: '#66615a',
  entity: '#1d1c1a',
  variable: '#45423d',
  tag: '#a63a0a',
  attribute: '#45423d',
});

export const draftingDark = createTheme('drafting-dark', 'dark', {
  background: '#1d1c19',
  foreground: '#ece8df',
  keyword: '#ff9363',
  string: '#8fb8d6',
  constant: '#f5ae86',
  comment: '#857f74',
  punctuation: '#979186',
  entity: '#ffffff',
  variable: '#c6c1b6',
  tag: '#ff9363',
  attribute: '#c6c1b6',
});
