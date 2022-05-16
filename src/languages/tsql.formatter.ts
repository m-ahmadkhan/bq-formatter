import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import type { StringPatternType } from '../core/regexFactory';
import { dedupe } from '../utils';

/**
 * Priority 5 (last)
 * Full list of reserved functions
 * distinct from Keywords due to interaction with parentheses
 */
// https://docs.microsoft.com/en-us/sql/t-sql/functions/functions?view=sql-server-ver15
const reservedFunctions = {
  aggregate: [
    'APPROX_COUNT_DISTINCT',
    'AVG',
    'CHECKSUM_AGG',
    'COUNT',
    'COUNT_BIG',
    'GROUPING',
    'GROUPING_ID',
    'MAX',
    'MIN',
    'STDEV',
    'STDEVP',
    'SUM',
    'VAR',
    'VARP',
  ],
  analytic: [
    'CUME_DIST',
    'FIRST_VALUE',
    'LAG',
    'LAST_VALUE',
    'LEAD',
    'PERCENTILE_CONT',
    'PERCENTILE_DISC',
    'PERCENT_RANK',
    'Collation - COLLATIONPROPERTY',
    'Collation - TERTIARY_WEIGHTS',
  ],
  configuration: [
    '@@DBTS',
    '@@LANGID',
    '@@LANGUAGE',
    '@@LOCK_TIMEOUT',
    '@@MAX_CONNECTIONS',
    '@@MAX_PRECISION',
    '@@NESTLEVEL',
    '@@OPTIONS',
    '@@REMSERVER',
    '@@SERVERNAME',
    '@@SERVICENAME',
    '@@SPID',
    '@@TEXTSIZE',
    '@@VERSION',
  ],
  conversion: ['CAST', 'CONVERT', 'PARSE', 'TRY_CAST', 'TRY_CONVERT', 'TRY_PARSE'],
  cryptographic: [
    'ASYMKEY_ID',
    'ASYMKEYPROPERTY',
    'CERTPROPERTY',
    'CERT_ID',
    'CRYPT_GEN_RANDOM',
    'DECRYPTBYASYMKEY',
    'DECRYPTBYCERT',
    'DECRYPTBYKEY',
    'DECRYPTBYKEYAUTOASYMKEY',
    'DECRYPTBYKEYAUTOCERT',
    'DECRYPTBYPASSPHRASE',
    'ENCRYPTBYASYMKEY',
    'ENCRYPTBYCERT',
    'ENCRYPTBYKEY',
    'ENCRYPTBYPASSPHRASE',
    'HASHBYTES',
    'IS_OBJECTSIGNED',
    'KEY_GUID',
    'KEY_ID',
    'KEY_NAME',
    'SIGNBYASYMKEY',
    'SIGNBYCERT',
    'SYMKEYPROPERTY',
    'VERIFYSIGNEDBYCERT',
    'VERIFYSIGNEDBYASYMKEY',
  ],
  cursor: ['@@CURSOR_ROWS', '@@FETCH_STATUS', 'CURSOR_STATUS'],
  dataType: [
    'DATALENGTH',
    'IDENT_CURRENT',
    'IDENT_INCR',
    'IDENT_SEED',
    'IDENTITY',
    'SQL_VARIANT_PROPERTY',
  ],
  datetime: [
    '@@DATEFIRST',
    'CURRENT_TIMESTAMP',
    'CURRENT_TIMEZONE',
    'CURRENT_TIMEZONE_ID',
    'DATEADD',
    'DATEDIFF',
    'DATEDIFF_BIG',
    'DATEFROMPARTS',
    'DATENAME',
    'DATEPART',
    'DATETIME2FROMPARTS',
    'DATETIMEFROMPARTS',
    'DATETIMEOFFSETFROMPARTS',
    'DAY',
    'EOMONTH',
    'GETDATE',
    'GETUTCDATE',
    'ISDATE',
    'MONTH',
    'SMALLDATETIMEFROMPARTS',
    'SWITCHOFFSET',
    'SYSDATETIME',
    'SYSDATETIMEOFFSET',
    'SYSUTCDATETIME',
    'TIMEFROMPARTS',
    'TODATETIMEOFFSET',
    'YEAR',
    'JSON',
    'ISJSON',
    'JSON_VALUE',
    'JSON_QUERY',
    'JSON_MODIFY',
  ],
  mathematical: [
    'ABS',
    'ACOS',
    'ASIN',
    'ATAN',
    'ATN2',
    'CEILING',
    'COS',
    'COT',
    'DEGREES',
    'EXP',
    'FLOOR',
    'LOG',
    'LOG10',
    'PI',
    'POWER',
    'RADIANS',
    'RAND',
    'ROUND',
    'SIGN',
    'SIN',
    'SQRT',
    'SQUARE',
    'TAN',
    'CHOOSE',
    'GREATEST',
    'IIF',
    'LEAST',
  ],
  metadata: [
    '@@PROCID',
    'APP_NAME',
    'APPLOCK_MODE',
    'APPLOCK_TEST',
    'ASSEMBLYPROPERTY',
    'COL_LENGTH',
    'COL_NAME',
    'COLUMNPROPERTY',
    'DATABASEPROPERTYEX',
    'DB_ID',
    'DB_NAME',
    'FILE_ID',
    'FILE_IDEX',
    'FILE_NAME',
    'FILEGROUP_ID',
    'FILEGROUP_NAME',
    'FILEGROUPPROPERTY',
    'FILEPROPERTY',
    'FILEPROPERTYEX',
    'FULLTEXTCATALOGPROPERTY',
    'FULLTEXTSERVICEPROPERTY',
    'INDEX_COL',
    'INDEXKEY_PROPERTY',
    'INDEXPROPERTY',
    'NEXT VALUE FOR',
    'OBJECT_DEFINITION',
    'OBJECT_ID',
    'OBJECT_NAME',
    'OBJECT_SCHEMA_NAME',
    'OBJECTPROPERTY',
    'OBJECTPROPERTYEX',
    'ORIGINAL_DB_NAME',
    'PARSENAME',
    'SCHEMA_ID',
    'SCHEMA_NAME',
    'SCOPE_IDENTITY',
    'SERVERPROPERTY',
    'STATS_DATE',
    'TYPE_ID',
    'TYPE_NAME',
    'TYPEPROPERTY',
  ],
  ranking: ['DENSE_RANK', 'NTILE', 'RANK', 'ROW_NUMBER', 'PUBLISHINGSERVERNAME'],
  security: [
    'CERTENCODED',
    'CERTPRIVATEKEY',
    'CURRENT_USER',
    'DATABASE_PRINCIPAL_ID',
    'HAS_DBACCESS',
    'HAS_PERMS_BY_NAME',
    'IS_MEMBER',
    'IS_ROLEMEMBER',
    'IS_SRVROLEMEMBER',
    'LOGINPROPERTY',
    'ORIGINAL_LOGIN',
    'PERMISSIONS',
    'PWDENCRYPT',
    'PWDCOMPARE',
    'SESSION_USER',
    'SESSIONPROPERTY',
    'SUSER_ID',
    'SUSER_NAME',
    'SUSER_SID',
    'SUSER_SNAME',
    'SYSTEM_USER',
    'USER',
    'USER_ID',
    'USER_NAME',
  ],
  string: [
    'ASCII',
    'CHAR',
    'CHARINDEX',
    'CONCAT',
    'CONCAT_WS',
    'DIFFERENCE',
    'FORMAT',
    'LEFT',
    'LEN',
    'LOWER',
    'LTRIM',
    'NCHAR',
    'PATINDEX',
    'QUOTENAME',
    'REPLACE',
    'REPLICATE',
    'REVERSE',
    'RIGHT',
    'RTRIM',
    'SOUNDEX',
    'SPACE',
    'STR',
    'STRING_AGG',
    'STRING_ESCAPE',
    'STUFF',
    'SUBSTRING',
    'TRANSLATE',
    'TRIM',
    'UNICODE',
    'UPPER',
  ],
  system: [
    '$PARTITION',
    '@@ERROR',
    '@@IDENTITY',
    '@@PACK_RECEIVED',
    '@@ROWCOUNT',
    '@@TRANCOUNT',
    'BINARY_CHECKSUM',
    'CHECKSUM',
    'COMPRESS',
    'CONNECTIONPROPERTY',
    'CONTEXT_INFO',
    'CURRENT_REQUEST_ID',
    'CURRENT_TRANSACTION_ID',
    'DECOMPRESS',
    'ERROR_LINE',
    'ERROR_MESSAGE',
    'ERROR_NUMBER',
    'ERROR_PROCEDURE',
    'ERROR_SEVERITY',
    'ERROR_STATE',
    'FORMATMESSAGE',
    'GET_FILESTREAM_TRANSACTION_CONTEXT',
    'GETANSINULL',
    'HOST_ID',
    'HOST_NAME',
    'ISNULL',
    'ISNUMERIC',
    'MIN_ACTIVE_ROWVERSION',
    'NEWID',
    'NEWSEQUENTIALID',
    'ROWCOUNT_BIG',
    'SESSION_CONTEXT',
    'XACT_STATE',
  ],
  statistical: [
    '@@CONNECTIONS',
    '@@CPU_BUSY',
    '@@IDLE',
    '@@IO_BUSY',
    '@@PACK_SENT',
    '@@PACKET_ERRORS',
    '@@TIMETICKS',
    '@@TOTAL_ERRORS',
    '@@TOTAL_READ',
    '@@TOTAL_WRITE',
    'TEXTPTR',
    'TEXTVALID',
  ],
  trigger: ['COLUMNS_UPDATED', 'EVENTDATA', 'TRIGGER_NESTLEVEL', 'UPDATE'],
};

// TODO: dedupe these reserved word lists
// https://docs.microsoft.com/en-us/sql/t-sql/language-elements/reserved-keywords-transact-sql?view=sql-server-ver15
/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
const reservedKeywords = {
  standard: [
    'ADD',
    'ALL',
    'ALTER',
    'AND',
    'ANY',
    'AS',
    'ASC',
    'AUTHORIZATION',
    'BACKUP',
    'BEGIN',
    'BETWEEN',
    'BREAK',
    'BROWSE',
    'BULK',
    'BY',
    'CASCADE',
    'CHECK',
    'CHECKPOINT',
    'CLOSE',
    'CLUSTERED',
    'COALESCE',
    'COLLATE',
    'COLUMN',
    'COMMIT',
    'COMPUTE',
    'CONSTRAINT',
    'CONTAINS',
    'CONTAINSTABLE',
    'CONTINUE',
    'CONVERT',
    'CREATE',
    'CROSS',
    'CURRENT',
    'CURRENT_DATE',
    'CURRENT_TIME',
    'CURRENT_TIMESTAMP',
    'CURRENT_USER',
    'CURSOR',
    'DATABASE',
    'DBCC',
    'DEALLOCATE',
    'DECLARE',
    'DEFAULT',
    'DELETE',
    'DENY',
    'DESC',
    'DISK',
    'DISTINCT',
    'DISTRIBUTED',
    'DOUBLE',
    'DROP',
    'DUMP',
    'ERRLVL',
    'ESCAPE',
    'EXEC',
    'EXECUTE',
    'EXISTS',
    'EXIT',
    'EXTERNAL',
    'FETCH',
    'FILE',
    'FILLFACTOR',
    'FOR',
    'FOREIGN',
    'FREETEXT',
    'FREETEXTTABLE',
    'FROM',
    'FULL',
    'FUNCTION',
    'GOTO',
    'GRANT',
    'GROUP',
    'HAVING',
    'HOLDLOCK',
    'IDENTITY',
    'IDENTITYCOL',
    'IDENTITY_INSERT',
    'IF',
    'IN',
    'INDEX',
    'INNER',
    'INSERT',
    'INTERSECT',
    'INTO',
    'IS',
    'JOIN',
    'KEY',
    'KILL',
    'LEFT',
    'LIKE',
    'LINENO',
    'LOAD',
    'MERGE',
    'NATIONAL',
    'NOCHECK',
    'NONCLUSTERED',
    'NOT',
    'NULL',
    'NULLIF',
    'OF',
    'OFF',
    'OFFSETS',
    'ON DELETE',
    'ON UPDATE',
    'OPEN',
    'OPENDATASOURCE',
    'OPENQUERY',
    'OPENROWSET',
    'OPENXML',
    'OPTION',
    'OR',
    'ORDER',
    'OUTER',
    'OVER',
    'PERCENT',
    'PIVOT',
    'PLAN',
    'PRECISION',
    'PRIMARY',
    'PRINT',
    'PROC',
    'PROCEDURE',
    'PUBLIC',
    'RAISERROR',
    'READ',
    'READTEXT',
    'RECONFIGURE',
    'REFERENCES',
    'REPLICATION',
    'RESTORE',
    'RESTRICT',
    'RETURN',
    'REVERT',
    'REVOKE',
    'RIGHT',
    'ROLLBACK',
    'ROWCOUNT',
    'ROWGUIDCOL',
    'RULE',
    'SAVE',
    'SCHEMA',
    'SECURITYAUDIT',
    'SELECT',
    'SEMANTICKEYPHRASETABLE',
    'SEMANTICSIMILARITYDETAILSTABLE',
    'SEMANTICSIMILARITYTABLE',
    'SESSION_USER',
    'SET',
    'SETUSER',
    'SHUTDOWN',
    'SOME',
    'STATISTICS',
    'SYSTEM_USER',
    'TABLE',
    'TABLESAMPLE',
    'TEXTSIZE',
    'THEN',
    'TO',
    'TOP',
    'TRAN',
    'TRANSACTION',
    'TRIGGER',
    'TRUNCATE',
    'TRY_CONVERT',
    'TSEQUAL',
    'UNION',
    'UNIQUE',
    'UNPIVOT',
    'UPDATE',
    'UPDATETEXT',
    'USE',
    'USER',
    'VALUES',
    'VARYING',
    'VIEW',
    'WAITFOR',
    'WHERE',
    'WHILE',
    'WITH',
    'WITHIN GROUP',
    'WRITETEXT',
  ],
  odbc: [
    'ABSOLUTE',
    'ACTION',
    'ADA',
    'ADD',
    'ALL',
    'ALLOCATE',
    'ALTER',
    'AND',
    'ANY',
    'ARE',
    'AS',
    'ASC',
    'ASSERTION',
    'AT',
    'AUTHORIZATION',
    'AVG',
    'BEGIN',
    'BETWEEN',
    'BIT',
    'BIT_LENGTH',
    'BOTH',
    'BY',
    'CASCADE',
    'CASCADED',
    'CAST',
    'CATALOG',
    'CHAR',
    'CHARACTER',
    'CHARACTER_LENGTH',
    'CHAR_LENGTH',
    'CHECK',
    'CLOSE',
    'COALESCE',
    'COLLATE',
    'COLLATION',
    'COLUMN',
    'COMMIT',
    'CONNECT',
    'CONNECTION',
    'CONSTRAINT',
    'CONSTRAINTS',
    'CONTINUE',
    'CONVERT',
    'CORRESPONDING',
    'COUNT',
    'CREATE',
    'CROSS',
    'CURRENT',
    'CURRENT_DATE',
    'CURRENT_TIME',
    'CURRENT_TIMESTAMP',
    'CURRENT_USER',
    'CURSOR',
    'DATE',
    'DAY',
    'DEALLOCATE',
    'DEC',
    'DECIMAL',
    'DECLARE',
    'DEFAULT',
    'DEFERRABLE',
    'DEFERRED',
    'DELETE',
    'DESC',
    'DESCRIBE',
    'DESCRIPTOR',
    'DIAGNOSTICS',
    'DISCONNECT',
    'DISTINCT',
    'DOMAIN',
    'DOUBLE',
    'DROP',
    'END-EXEC',
    'ESCAPE',
    'EXCEPTION',
    'EXEC',
    'EXECUTE',
    'EXISTS',
    'EXTERNAL',
    'EXTRACT',
    'FALSE',
    'FETCH',
    'FIRST',
    'FLOAT',
    'FOR',
    'FOREIGN',
    'FORTRAN',
    'FOUND',
    'FROM',
    'FULL',
    'GET',
    'GLOBAL',
    'GO',
    'GOTO',
    'GRANT',
    'GROUP',
    'HAVING',
    'HOUR',
    'IDENTITY',
    'IMMEDIATE',
    'IN',
    'INCLUDE',
    'INDEX',
    'INDICATOR',
    'INITIALLY',
    'INNER',
    'INPUT',
    'INSENSITIVE',
    'INSERT',
    'INT',
    'INTEGER',
    'INTERSECT',
    'INTERVAL',
    'INTO',
    'IS',
    'ISOLATION',
    'JOIN',
    'KEY',
    'LANGUAGE',
    'LAST',
    'LEADING',
    'LEFT',
    'LEVEL',
    'LIKE',
    'LOCAL',
    'LOWER',
    'MATCH',
    'MAX',
    'MIN',
    'MINUTE',
    'MODULE',
    'MONTH',
    'NAMES',
    'NATIONAL',
    'NATURAL',
    'NCHAR',
    'NEXT',
    'NO',
    'NONE',
    'NOT',
    'NULL',
    'NULLIF',
    'NUMERIC',
    'OCTET_LENGTH',
    'OF',
    'ONLY',
    'OPEN',
    'OPTION',
    'OR',
    'ORDER',
    'OUTER',
    'OUTPUT',
    'OVERLAPS',
    'PAD',
    'PARTIAL',
    'PASCAL',
    'POSITION',
    'PRECISION',
    'PREPARE',
    'PRESERVE',
    'PRIMARY',
    'PRIOR',
    'PRIVILEGES',
    'PROCEDURE',
    'PUBLIC',
    'READ',
    'REAL',
    'REFERENCES',
    'RELATIVE',
    'RESTRICT',
    'REVOKE',
    'RIGHT',
    'ROLLBACK',
    'ROWS',
    'SCHEMA',
    'SCROLL',
    'SECOND',
    'SECTION',
    'SELECT',
    'SESSION',
    'SESSION_USER',
    'SET',
    'SIZE',
    'SMALLINT',
    'SOME',
    'SPACE',
    'SQL',
    'SQLCA',
    'SQLCODE',
    'SQLERROR',
    'SQLSTATE',
    'SQLWARNING',
    'SUBSTRING',
    'SUM',
    'SYSTEM_USER',
    'TABLE',
    'TEMPORARY',
    'TIME',
    'TIMESTAMP',
    'TIMEZONE_HOUR',
    'TIMEZONE_MINUTE',
    'TO',
    'TRAILING',
    'TRANSACTION',
    'TRANSLATE',
    'TRANSLATION',
    'TRIM',
    'TRUE',
    'UNION',
    'UNIQUE',
    'UNKNOWN',
    'UPDATE',
    'UPPER',
    'USAGE',
    'USER',
    'VALUE',
    'VALUES',
    'VARCHAR',
    'VARYING',
    'VIEW',
    'WHENEVER',
    'WHERE',
    'WITH',
    'WORK',
    'WRITE',
    'YEAR',
    'ZONE',
  ],
  future: [
    'ABSOLUTE',
    'ACTION',
    'ADMIN',
    'AFTER',
    'AGGREGATE',
    'ALIAS',
    'ALLOCATE',
    'ARE',
    'ARRAY',
    'ASENSITIVE',
    'ASSERTION',
    'ASYMMETRIC',
    'AT',
    'ATOMIC',
    'BEFORE',
    'BINARY',
    'BIT',
    'BLOB',
    'BOOLEAN',
    'BOTH',
    'BREADTH',
    'CALL',
    'CALLED',
    'CARDINALITY',
    'CASCADED',
    'CAST',
    'CATALOG',
    'CHAR',
    'CHARACTER',
    'CLASS',
    'CLOB',
    'COLLATION',
    'COLLECT',
    'COMPLETION',
    'CONDITION',
    'CONNECT',
    'CONNECTION',
    'CONSTRAINTS',
    'CONSTRUCTOR',
    'CORR',
    'CORRESPONDING',
    'COVAR_POP',
    'COVAR_SAMP',
    'CUBE',
    'CUME_DIST',
    'CURRENT_CATALOG',
    'CURRENT_DEFAULT_TRANSFORM_GROUP',
    'CURRENT_PATH',
    'CURRENT_ROLE',
    'CURRENT_SCHEMA',
    'CURRENT_TRANSFORM_GROUP_FOR_TYPE',
    'CYCLE',
    'DATA',
    'DATE',
    'DAY',
    'DEC',
    'DECIMAL',
    'DEFERRABLE',
    'DEFERRED',
    'DEPTH',
    'DEREF',
    'DESCRIBE',
    'DESCRIPTOR',
    'DESTROY',
    'DESTRUCTOR',
    'DETERMINISTIC',
    'DIAGNOSTICS',
    'DICTIONARY',
    'DISCONNECT',
    'DOMAIN',
    'DYNAMIC',
    'EACH',
    'ELEMENT',
    'END-EXEC',
    'EQUALS',
    'EVERY',
    'FALSE',
    'FILTER',
    'FIRST',
    'FLOAT',
    'FOUND',
    'FREE',
    'FULLTEXTTABLE',
    'FUSION',
    'GENERAL',
    'GET',
    'GLOBAL',
    'GO',
    'GROUPING',
    'HOLD',
    'HOST',
    'HOUR',
    'IGNORE',
    'IMMEDIATE',
    'INDICATOR',
    'INITIALIZE',
    'INITIALLY',
    'INOUT',
    'INPUT',
    'INT',
    'INTEGER',
    'INTERSECTION',
    'INTERVAL',
    'ISOLATION',
    'ITERATE',
    'LANGUAGE',
    'LARGE',
    'LAST',
    'LATERAL',
    'LEADING',
    'LESS',
    'LEVEL',
    'LIKE_REGEX',
    'LIMIT',
    'LN',
    'LOCAL',
    'LOCALTIME',
    'LOCALTIMESTAMP',
    'LOCATOR',
    'MAP',
    'MATCH',
    'MEMBER',
    'METHOD',
    'MINUTE',
    'MOD',
    'MODIFIES',
    'MODIFY',
    'MODULE',
    'MONTH',
    'MULTISET',
    'NAMES',
    'NATURAL',
    'NCHAR',
    'NCLOB',
    'NEW',
    'NEXT',
    'NO',
    'NONE',
    'NORMALIZE',
    'NUMERIC',
    'OBJECT',
    'OCCURRENCES_REGEX',
    'OLD',
    'ONLY',
    'OPERATION',
    'ORDINALITY',
    'OUT',
    'OUTPUT',
    'OVERLAY',
    'PAD',
    'PARAMETER',
    'PARAMETERS',
    'PARTIAL',
    'PARTITION',
    'PATH',
    'PERCENTILE_CONT',
    'PERCENTILE_DISC',
    'PERCENT_RANK',
    'POSITION_REGEX',
    'POSTFIX',
    'PREFIX',
    'PREORDER',
    'PREPARE',
    'PRESERVE',
    'PRIOR',
    'PRIVILEGES',
    'RANGE',
    'READS',
    'REAL',
    'RECURSIVE',
    'REF',
    'REFERENCING',
    'REGR_AVGX',
    'REGR_AVGY',
    'REGR_COUNT',
    'REGR_INTERCEPT',
    'REGR_R2',
    'REGR_SLOPE',
    'REGR_SXX',
    'REGR_SXY',
    'REGR_SYY',
    'RELATIVE',
    'RELEASE',
    'RESULT',
    'RETURNS',
    'ROLE',
    'ROLLUP',
    'ROUTINE',
    'ROW',
    'ROWS',
    'SAVEPOINT',
    'SCOPE',
    'SCROLL',
    'SEARCH',
    'SECOND',
    'SECTION',
    'SENSITIVE',
    'SEQUENCE',
    'SESSION',
    'SETS',
    'SIMILAR',
    'SIZE',
    'SMALLINT',
    'SPACE',
    'SPECIFIC',
    'SPECIFICTYPE',
    'SQL',
    'SQLEXCEPTION',
    'SQLSTATE',
    'SQLWARNING',
    'START',
    'STATE',
    'STATEMENT',
    'STATIC',
    'STDDEV_POP',
    'STDDEV_SAMP',
    'STRUCTURE',
    'SUBMULTISET',
    'SUBSTRING_REGEX',
    'SYMMETRIC',
    'SYSTEM',
    'TEMPORARY',
    'TERMINATE',
    'THAN',
    'TIME',
    'TIMESTAMP',
    'TIMEZONE_HOUR',
    'TIMEZONE_MINUTE',
    'TRAILING',
    'TRANSLATE_REGEX',
    'TRANSLATION',
    'TREAT',
    'TRUE',
    'UESCAPE',
    'UNDER',
    'UNKNOWN',
    'UNNEST',
    'USAGE',
    'USING',
    'VALUE',
    'VARCHAR',
    'VARIABLE',
    'VAR_POP',
    'VAR_SAMP',
    'WHENEVER',
    'WIDTH_BUCKET',
    'WINDOW',
    'WITHIN',
    'WITHOUT',
    'WORK',
    'WRITE',
    'XMLAGG',
    'XMLATTRIBUTES',
    'XMLBINARY',
    'XMLCAST',
    'XMLCOMMENT',
    'XMLCONCAT',
    'XMLDOCUMENT',
    'XMLELEMENT',
    'XMLEXISTS',
    'XMLFOREST',
    'XMLITERATE',
    'XMLNAMESPACES',
    'XMLPARSE',
    'XMLPI',
    'XMLQUERY',
    'XMLSERIALIZE',
    'XMLTABLE',
    'XMLTEXT',
    'XMLVALIDATE',
    'YEAR',
    'ZONE',
  ],
};

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
// https://docs.microsoft.com/en-us/sql/t-sql/statements/statements?view=sql-server-ver15
const reservedCommands = [
  'ADD SENSITIVITY CLASSIFICATION',
  'ADD SIGNATURE',
  'AGGREGATE',
  'ANSI_DEFAULTS',
  'ANSI_NULLS',
  'ANSI_NULL_DFLT_OFF',
  'ANSI_NULL_DFLT_ON',
  'ANSI_PADDING',
  'ANSI_WARNINGS',
  'APPLICATION ROLE',
  'ARITHABORT',
  'ARITHIGNORE',
  'ASSEMBLY',
  'ASYMMETRIC KEY',
  'AUTHORIZATION',
  'AVAILABILITY GROUP',
  'BACKUP',
  'BACKUP CERTIFICATE',
  'BACKUP MASTER KEY',
  'BACKUP SERVICE MASTER KEY',
  'BEGIN CONVERSATION TIMER',
  'BEGIN DIALOG CONVERSATION',
  'BROKER PRIORITY',
  'BULK INSERT',
  'CERTIFICATE',
  'CLOSE MASTER KEY',
  'CLOSE SYMMETRIC KEY',
  'COLLATE',
  'COLUMN ENCRYPTION KEY',
  'COLUMN MASTER KEY',
  'COLUMNSTORE INDEX',
  'CONCAT_NULL_YIELDS_NULL',
  'CONTEXT_INFO',
  'CONTRACT',
  'CREDENTIAL',
  'CRYPTOGRAPHIC PROVIDER',
  'CURSOR_CLOSE_ON_COMMIT',
  'DATABASE',
  'DATABASE AUDIT SPECIFICATION',
  'DATABASE ENCRYPTION KEY',
  'DATABASE HADR',
  'DATABASE SCOPED CONFIGURATION',
  'DATABASE SCOPED CREDENTIAL',
  'DATABASE SET',
  'DATEFIRST',
  'DATEFORMAT',
  'DEADLOCK_PRIORITY',
  'DEFAULT',
  'DELETE',
  'DELETE FROM',
  'DENY',
  'DENY XML',
  'DISABLE TRIGGER',
  'ENABLE TRIGGER',
  'END CONVERSATION',
  'ENDPOINT',
  'EVENT NOTIFICATION',
  'EVENT SESSION',
  'EXECUTE AS',
  'EXTERNAL DATA SOURCE',
  'EXTERNAL FILE FORMAT',
  'EXTERNAL LANGUAGE',
  'EXTERNAL LIBRARY',
  'EXTERNAL RESOURCE POOL',
  'EXTERNAL TABLE',
  'FIPS_FLAGGER',
  'FMTONLY',
  'FORCEPLAN',
  'FULLTEXT CATALOG',
  'FULLTEXT INDEX',
  'FULLTEXT STOPLIST',
  'FUNCTION',
  'GET CONVERSATION GROUP',
  'GET_TRANSMISSION_STATUS',
  'GRANT',
  'GRANT XML',
  'IDENTITY_INSERT',
  'IMPLICIT_TRANSACTIONS',
  'INDEX',
  'INSERT',
  'LANGUAGE',
  'LOCK_TIMEOUT',
  'LOGIN',
  'MASTER KEY',
  'MERGE',
  'MESSAGE TYPE',
  'MOVE CONVERSATION',
  'NOCOUNT',
  'NOEXEC',
  'NUMERIC_ROUNDABORT',
  'OFFSETS',
  'OPEN MASTER KEY',
  'OPEN SYMMETRIC KEY',
  'PARSEONLY',
  'PARTITION FUNCTION',
  'PARTITION SCHEME',
  'PROCEDURE',
  'QUERY_GOVERNOR_COST_LIMIT',
  'QUEUE',
  'QUOTED_IDENTIFIER',
  'RECEIVE',
  'REMOTE SERVICE BINDING',
  'REMOTE_PROC_TRANSACTIONS',
  'RESOURCE GOVERNOR',
  'RESOURCE POOL',
  'RESTORE',
  'RESTORE FILELISTONLY',
  'RESTORE HEADERONLY',
  'RESTORE LABELONLY',
  'RESTORE MASTER KEY',
  'RESTORE REWINDONLY',
  'RESTORE SERVICE MASTER KEY',
  'RESTORE VERIFYONLY',
  'REVERT',
  'REVOKE',
  'REVOKE XML',
  'ROLE',
  'ROUTE',
  'ROWCOUNT',
  'RULE',
  'SCHEMA',
  'SEARCH PROPERTY LIST',
  'SECURITY POLICY',
  'SELECTIVE XML INDEX',
  'SEND',
  'SENSITIVITY CLASSIFICATION',
  'SEQUENCE',
  'SERVER AUDIT',
  'SERVER AUDIT SPECIFICATION',
  'SERVER CONFIGURATION',
  'SERVER ROLE',
  'SERVICE',
  'SERVICE MASTER KEY',
  'SET',
  'SETUSER',
  'SHOWPLAN_ALL',
  'SHOWPLAN_TEXT',
  'SHOWPLAN_XML',
  'SIGNATURE',
  'SPATIAL INDEX',
  'STATISTICS',
  'STATISTICS IO',
  'STATISTICS PROFILE',
  'STATISTICS TIME',
  'STATISTICS XML',
  'SYMMETRIC KEY',
  'SYNONYM',
  'TABLE',
  'TABLE IDENTITY',
  'TEXTSIZE',
  'TRANSACTION ISOLATION LEVEL',
  'TRIGGER',
  'TRUNCATE TABLE',
  'TYPE',
  'UPDATE',
  'UPDATE STATISTICS',
  'USER',
  'VIEW',
  'WORKLOAD GROUP',
  'XACT_ABORT',
  'XML INDEX',
  'XML SCHEMA COLLECTION',
  // other
  'ALTER COLUMN',
  'ALTER TABLE',
  'CREATE TABLE',
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT INTO', // verify
  'DROP TABLE', // verify
  'SET SCHEMA', // verify
  'LIMIT',
  'OFFSET',
  'ORDER BY',
  'SELECT',
  'VALUES',
  'WHERE',
  'WITH',
];

/**
 * Priority 2
 * commands that operate on two tables or subqueries
 * two main categories: joins and boolean set operators
 */
const reservedBinaryCommands = [
  // set booleans
  'INTERSECT',
  'INTERSECT ALL',
  'INTERSECT DISTINCT',
  'UNION',
  'UNION ALL',
  'UNION DISTINCT',
  'EXCEPT',
  'EXCEPT ALL',
  'EXCEPT DISTINCT',
  'MINUS',
  'MINUS ALL',
  'MINUS DISTINCT',
  // joins
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
  'FULL JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
];

/**
 * Priority 3
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['WHEN', 'ELSE'];

// https://docs.microsoft.com/en-us/sql/t-sql/language-reference?view=sql-server-ver15
export default class TSqlFormatter extends Formatter {
  static reservedCommands = reservedCommands;
  static reservedBinaryCommands = reservedBinaryCommands;
  static reservedDependentClauses = reservedDependentClauses;
  static reservedJoinConditions = ['ON', 'USING'];
  static reservedLogicalOperators = ['AND', 'OR'];
  static reservedKeywords = dedupe([
    ...Object.values(reservedFunctions).reduce((acc, arr) => [...acc, ...arr], []),
    ...Object.values(reservedKeywords).reduce((acc, arr) => [...acc, ...arr], []),
  ]);
  static stringTypes: StringPatternType[] = [`""`, "N''", "''", '[]', '``'];
  static blockStart = ['('];
  static blockEnd = [')'];
  static indexedPlaceholderTypes = [];
  static namedPlaceholderTypes = ['@'];
  static lineCommentTypes = ['--'];
  static specialWordChars = { any: '#@' };
  static operators = ['!<', '!>', '+=', '-=', '*=', '/=', '%=', '|=', '&=', '^=', '::'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands: TSqlFormatter.reservedCommands,
      reservedBinaryCommands: TSqlFormatter.reservedBinaryCommands,
      reservedDependentClauses: TSqlFormatter.reservedDependentClauses,
      reservedJoinConditions: TSqlFormatter.reservedJoinConditions,
      reservedLogicalOperators: TSqlFormatter.reservedLogicalOperators,
      reservedKeywords: TSqlFormatter.reservedKeywords,
      stringTypes: TSqlFormatter.stringTypes,
      blockStart: TSqlFormatter.blockStart,
      blockEnd: TSqlFormatter.blockEnd,
      indexedPlaceholderTypes: TSqlFormatter.indexedPlaceholderTypes,
      namedPlaceholderTypes: TSqlFormatter.namedPlaceholderTypes,
      lineCommentTypes: TSqlFormatter.lineCommentTypes,
      specialWordChars: TSqlFormatter.specialWordChars,
      operators: TSqlFormatter.operators,
      // TODO: Support for money constants
    });
  }
}
