import * as vscode from 'vscode';
import { format, FormatFnOptions } from 'sql-formatter';
import type {
  SqlLanguage,
  KeywordCase,
  IndentStyle,
  AliasMode,
  CommaPosition,
  LogicalOperatorNewline,
} from 'sql-formatter';

const hasNoFormat = (query: string) => {
  return !!query.trim().match(/^(--|\/\*)\s*@no-format/);
};

const formatInternal = (query: string, cfg?: Partial<FormatFnOptions>) => {
  if (hasNoFormat(query))
    return query;
  return format(query, cfg);
};

const getConfigs = (
  settings: vscode.WorkspaceConfiguration,
  tabOptions: vscode.FormattingOptions | { tabSize: number; insertSpaces: boolean },
  fileLanguage: SqlLanguage
) => {
  // build format configs from settings

  const language = settings.get<SqlLanguage>('language') ?? fileLanguage;
  const tabWidth = settings.get<number>('tabWidth') ?? tabOptions.tabSize ?? 2;
  const useTabs = settings.get<boolean>('useTabs') ?? !tabOptions.insertSpaces ?? false;
  const keywordCase = settings.get<KeywordCase>('keywordCase') ?? 'upper';
  const indentStyle = settings.get<IndentStyle>('indentStyle') ?? 'standard';
  const logicalOperatorNewline =
    settings.get<LogicalOperatorNewline>('logicalOperatorNewline') ?? 'before';
  const aliasAs = settings.get<AliasMode>('aliasAs') ?? 'always';
  const tabulateAlias = settings.get<boolean>('tabulateAlias') ?? false;
  const commaPosition = settings.get<CommaPosition>('commaPosition') ?? 'after';
  const expressionWidth = settings.get<number>('expressionWidth') ?? 50;
  const linesBetweenQueries = settings.get<number>('linesBetweenQueries') ?? 2;
  const denseOperators = settings.get<boolean>('denseOperators') ?? false;
  const newlineBeforeSemicolon = settings.get<boolean>('newlineBeforeSemicolon') ?? false;

  const indent = useTabs ? '\t' : ' '.repeat(tabWidth);

  const formatConfigs = {
    language,
    indent,
    keywordCase,
    indentStyle,
    logicalOperatorNewline,
    aliasAs,
    tabulateAlias,
    commaPosition,
    expressionWidth,
    linesBetweenQueries,
    denseOperators,
    newlineBeforeSemicolon,
  };
  return formatConfigs;
};

export function activate(context: vscode.ExtensionContext) {
  const formatProvider = (language: SqlLanguage) => ({
    provideDocumentFormattingEdits(
      document: vscode.TextDocument,
      options: vscode.FormattingOptions
    ): vscode.TextEdit[] {
      const settings = vscode.workspace.getConfiguration('bq-formatter');
      const formatConfigs = getConfigs(settings, options, language);

      // extract all lines from document
      const lines = [...new Array(document.lineCount)].map((_, i) => document.lineAt(i).text);
      let text;
      try {
        text = formatInternal(lines.join('\n'), formatConfigs);
        if (settings.get('insertFinalNewline') && !text.endsWith('\n')) {
          text = text + '\n';
        }
      } catch (e) {
        vscode.window.showErrorMessage('Unable to format SQL:\n' + e);
        return [];
      }

      // replace document with formatted text
      return [
        vscode.TextEdit.replace(
          new vscode.Range(
            document.positionAt(0),
            document.lineAt(document.lineCount - 1).range.end
          ),
          text,
        ),
      ];
    },
  });

  const languages: { [lang: string]: SqlLanguage } = {
    'sql': 'sql',
    'plsql': 'plsql',
    'mysql': 'mysql',
    'postgres': 'postgresql',
    'hql': 'hive',
    'hive-sql': 'hive',
    'sql-bigquery': 'bigquery',
    'sqlite': 'sqlite',
  };

  // add bq-formatter as a format provider for each language
  Object.entries(languages).forEach(([vscodeLang, prettierLang]) =>
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(
        vscodeLang,
        formatProvider(prettierLang)
      )
    )
  );

  const formatSelectionCommand = vscode.commands.registerCommand(
    'bq-formatter.format-selection',
    () => {
      const documentLanguage =
        vscode.window.activeTextEditor?.document.languageId ?? 'sql-bigquery';
      const formatterLanguage = languages[documentLanguage] ?? 'bigquery';

      const settings = vscode.workspace.getConfiguration('bq-formatter');

      // get tab settings from workspace
      const workspaceConfig = vscode.workspace.getConfiguration('editor');
      const tabOptions = {
        tabSize: workspaceConfig.get<number>('tabSize')!,
        insertSpaces: workspaceConfig.get<boolean>('insertSpaces')!,
      };

      const formatConfigs = getConfigs(settings, tabOptions, formatterLanguage);

      const editor = vscode.window.activeTextEditor;
      try {
        // format and replace each selection
        editor?.edit(editBuilder => {
          editor.selections.forEach(sel =>
            editBuilder.replace(sel, formatInternal(editor.document.getText(sel), formatConfigs))
          );
        });
      } catch (e) {
        vscode.window.showErrorMessage('Unable to format SQL:\n' + e);
      }
    }
  );

  context.subscriptions.push(formatSelectionCommand);
}

export function deactivate() {}
