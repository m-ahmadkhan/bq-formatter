# BQ Formatter

Formats SQL (default dialect: bigquery-sql) files using the [`sql-formatter`](https://github.com/sql-formatter-org/sql-formatter) library.

Supported SQL dialects: sql, bigquery, db2, hive, mariadb, mysql, n1ql, plsql, postgresql, redshift, spark, sqlite, tsql

## Issues

Please report issues here: https://github.com/m-ahmadkhan/bq-formatter/issues

## Configuration

`bq-formatter.language`: Uses custom SQL Flavour to format `sql` files.

Possible values: sql, bigquery, db2, hive, mariadb, mysql, n1ql, plsql, postgresql, redshift, spark, sqlite, tsql.

Defaults to bigquery if no VSCode language is found.

`bq-formatter.tabWidth`: (number) bq-formatter.tabWidth gets preference over editor.tabSize if specified. Default: 2.

`bq-formatter.useTabs`: (boolean) If not specified, !editor.insertSpaces is used in its place. Default: false.

`bq-formatter.keywordCase`: Whether to print keywords in UPPERCASE, lowercase, or preserve existing.

Possible values: (preserve, lower, upper). Default: upper.

`bq-formatter.indentStyle`: Whether to indent keywords or not.

Possible values: (standard, tabularLeft, tabularRight). Default: standard.

`bq-formatter.multilineLists`: Whether to split lists in multiline or not.

Possible values: (always, avoid, expressionWidth, or a number). Default: 4.

`bq-formatter.logicalOperatorNewline`: Whether to break before or after logical operators (AND, OR, etc.)

Possible values: (before, after). Default: before.

`bq-formatter.aliasAs`: Where to use AS in column or table aliases.

Possible values: (preserve, always, select, never). Default: always.

`bq-formatter.tabulateAlias`: (boolean) Whether to right-align aliases to the longest line in the SELECT clause. Default: false.

`bq-formatter.commaPosition`: Where to place commas for SELECT and GROUP BY clauses.

Possible values: (before, after, tabular). Default: after.

`bq-formatter.newlineBeforeOpenParen`: (boolean) Place (, Open Paren, CASE on newline when creating a new block. Default: true.

`bq-formatter.newlineBeforeCloseParen`: (boolean) Place ), Close Paren, END on newline when closing a block. Default: true.

`bq-formatter.expressionWidth`: (number) Number of characters allowed in each line before breaking. Default: 50.

`bq-formatter.linesBetweenQueries`: (number) How many newlines to place between each query / statement. Default: 2.

`bq-formatter.denseOperators`: (boolean) Strip whitespace around operators such as + or >=. Default: false.

`bq-formatter.newlineBeforeSemicolon`: (boolean) Whether to place semicolon on its own line or on previous line. Default: false.

`bq-formatter.insertFinalNewline`: (boolean) Whether to insert a final newline at the end of the file or not. Default: true.
