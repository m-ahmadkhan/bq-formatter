import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import type { StringPatternType } from '../core/regexFactory';
import { dedupe } from '../utils';

/**
 * Priority 5 (last)
 * Full list of reserved functions
 * distinct from Keywords due to interaction with parentheses
 */
const reservedFunctions = {
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-aggregate
  aggregate: [
    'ARRAY_AGG',
    'AVG',
    'CORR',
    'CORRELATION',
    'COUNT',
    'COUNT_BIG',
    'COVAR_POP',
    'COVARIANCE',
    'COVAR',
    'COVAR_SAMP',
    'COVARIANCE_SAMP',
    'CUME_DIST',
    'GROUPING',
    'LISTAGG',
    'MAX',
    'MEDIAN',
    'MIN',
    'PERCENTILE_CONT',
    'PERCENTILE_DISC',
    'PERCENT_RANK',
    'REGR_AVGX',
    'REGR_AVGY',
    'REGR_COUNT',
    'REGR_INTERCEPT',
    'REGR_ICPT',
    'REGR_R2',
    'REGR_SLOPE',
    'REGR_SXX',
    'REGR_SXY',
    'REGR_SYY',
    'STDDEV_POP',
    'STDDEV',
    'STDDEV_SAMP',
    'SUM',
    'VAR_POP',
    'VARIANCE',
    'VAR',
    'VAR_SAMP',
    'VARIANCE_SAMP',
    'XMLAGG',
  ],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-scalar
  scalar: [
    'ABS',
    'ABSVAL',
    'ACOS',
    'ADD_DAYS',
    'ADD_MONTHS',
    'ARRAY_DELETE',
    'ARRAY_FIRST',
    'ARRAY_LAST',
    'ARRAY_NEXT',
    'ARRAY_PRIOR',
    'ARRAY_TRIM',
    'ASCII',
    'ASCII_CHR',
    'ASCII_STR',
    'ASCIISTR',
    'ASIN',
    'ATAN',
    'ATANH',
    'ATAN2',
    'BIGINT',
    'BINARY',
    'BITAND',
    'BITANDNOT',
    'BITOR',
    'BITXOR',
    'BITNOT',
    'BLOB',
    'BTRIM',
    'CARDINALITY',
    'CCSID_ENCODING',
    'CEILING',
    'CEIL',
    'CHAR',
    'CHAR9',
    'CHARACTER_LENGTH',
    'CHAR_LENGTH',
    'CHR',
    'CLOB',
    'COALESCE',
    'COLLATION_KEY',
    'COMPARE_DECFLOAT',
    'CONCAT',
    'CONTAINS',
    'COS',
    'COSH',
    'DATE',
    'DAY',
    'DAYOFMONTH',
    'DAYOFWEEK',
    'DAYOFWEEK_ISO',
    'DAYOFYEAR',
    'DAYS',
    'DAYS_BETWEEN',
    'DBCLOB',
    'DECFLOAT',
    'DECFLOAT_FORMAT',
    'DECFLOAT_SORTKEY',
    'DECIMAL',
    'DEC',
    'DECODE',
    'DECRYPT_BINARY',
    'DECRYPT_BIT',
    'DECRYPT_CHAR',
    'DECRYPT_DB',
    'DECRYPT_DATAKEY_BIGINT',
    'DECRYPT_DATAKEY_BIT',
    'DECRYPT_DATAKEY_CLOB',
    'DECRYPT_DATAKEY_DBCLOB',
    'DECRYPT_DATAKEY_DECIMAL',
    'DECRYPT_DATAKEY_INTEGER',
    'DECRYPT_DATAKEY_VARCHAR',
    'DECRYPT_DATAKEY_VARGRAPHIC',
    'DEGREES',
    'DIFFERENCE',
    'DIGITS',
    'DOUBLE_PRECISION',
    'DOUBLE',
    'DSN_XMLVALIDATE',
    'EBCDIC_CHR',
    'EBCDIC_STR',
    'ENCRYPT_DATAKEY',
    'ENCRYPT_TDES',
    'EXP',
    'EXTRACT',
    'FLOAT',
    'FLOOR',
    'GENERATE_UNIQUE',
    'GENERATE_UNIQUE_BINARY',
    'GETHINT',
    'GETVARIABLE',
    'GRAPHIC',
    'GREATEST',
    'HASH',
    'HASH_CRC32',
    'HASH_MD5',
    'HASH_SHA1',
    'HASH_SHA256',
    'HEX',
    'HOUR',
    'IDENTITY_VAL_LOCAL',
    'IFNULL',
    'INSERT',
    'INSTR',
    'INTEGER',
    'INT',
    'JULIAN_DAY',
    'LAST_DAY',
    'LCASE',
    'LEAST',
    'LEFT',
    'LENGTH',
    'LN',
    'LOCATE',
    'LOCATE_IN_STRING',
    'LOG10',
    'LOWER',
    'LPAD',
    'LTRIM',
    'MAX',
    'MAX_CARDINALITY',
    'MICROSECOND',
    'MIDNIGHT_SECONDS',
    'MIN',
    'MINUTE',
    'MOD',
    'MONTH',
    'MONTHS_BETWEEN',
    'MQREAD',
    'MQREADCLOB',
    'MQRECEIVE',
    'MQRECEIVECLOB',
    'MQSEND',
    'MULTIPLY_ALT',
    'NEXT_DAY',
    'NEXT_MONTH',
    'NORMALIZE_DECFLOAT',
    'NORMALIZE_STRING',
    'NULLIF',
    'NVL',
    'OVERLAY',
    'PACK',
    'POSITION',
    'POSSTR',
    'POWER',
    'POW',
    'QUANTIZE',
    'QUARTER',
    'RADIANS',
    'RAISE_ERROR',
    'RANDOM',
    'RAND',
    'REAL',
    'REGEXP_COUNT',
    'REGEXP_INSTR',
    'REGEXP_LIKE',
    'REGEXP_REPLACE',
    'REGEXP_SUBSTR',
    'REPEAT',
    'REPLACE',
    'RID',
    'RIGHT',
    'ROUND',
    'ROUND_TIMESTAMP',
    'ROWID',
    'RPAD',
    'RTRIM',
    'SCORE',
    'SECOND',
    'SIGN',
    'SIN',
    'SINH',
    'SMALLINT',
    'SOUNDEX',
    'SOAPHTTPC',
    'SOAPHTTPV',
    'SOAPHTTPNC',
    'SOAPHTTPNV',
    'SPACE',
    'SQRT',
    'STRIP',
    'STRLEFT',
    'STRPOS',
    'STRRIGHT',
    'SUBSTR',
    'SUBSTRING',
    'TAN',
    'TANH',
    'TIME',
    'TIMESTAMP',
    'TIMESTAMPADD',
    'TIMESTAMPDIFF',
    'TIMESTAMP_FORMAT',
    'TIMESTAMP_ISO',
    'TIMESTAMP_TZ',
    'TO_CHAR',
    'TO_CLOB',
    'TO_DATE',
    'TO_NUMBER',
    'TOTALORDER',
    'TO_TIMESTAMP',
    'TRANSLATE',
    'TRIM',
    'TRIM_ARRAY',
    'TRUNCATE',
    'TRUNC',
    'TRUNC_TIMESTAMP',
    'UCASE',
    'UNICODE',
    'UNICODE_STR',
    'UNISTR',
    'UPPER',
    'VALUE',
    'VARBINARY',
    'VARCHAR',
    'VARCHAR9',
    'VARCHAR_BIT_FORMAT',
    'VARCHAR_FORMAT',
    'VARGRAPHIC',
    'VERIFY_GROUP_FOR_USER',
    'VERIFY_ROLE_FOR_USER',
    'VERIFY_TRUSTED_CONTEXT_ROLE_FOR_USER',
    'WEEK',
    'WEEK_ISO',
    'WRAP',
    'XMLATTRIBUTES',
    'XMLCOMMENT',
    'XMLCONCAT',
    'XMLDOCUMENT',
    'XMLELEMENT',
    'XMLFOREST',
    'XMLMODIFY',
    'XMLNAMESPACES',
    'XMLPARSE',
    'XMLPI',
    'XMLQUERY',
    'XMLSERIALIZE',
    'XMLTEXT',
    'XMLXSROBJECTID',
    'XSLTRANSFORM',
    'YEAR',
  ],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-table
  table: [
    'ADMIN_TASK_LIST',
    'ADMIN_TASK_OUTPUT',
    'ADMIN_TASK_STATUS',
    'BLOCKING_THREADS',
    'MQREADALL',
    'MQREADALLCLOB',
    'MQRECEIVEALL',
    'MQRECEIVEALLCLOB',
    'XMLTABLE',
  ],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-row
  row: ['UNPACK'],
  // https://www.ibm.com/docs/en/db2-for-zos/12?topic=expressions-olap-specification
  olap: ['FIRST_VALUE', 'LAG', 'LAST_VALUE', 'LEAD', 'NTH_VALUE', 'NTILE', 'RATIO_TO_REPORT'],
};

/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
const reservedKeywords = {
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=words-reserved#db2z_reservedwords__newresword
  standard: [
    'ALL',
    'ALLOCATE',
    'ALLOW',
    'ALTERAND',
    'ANY',
    'AS',
    'ARRAY',
    'ARRAY_EXISTS',
    'ASENSITIVE',
    'ASSOCIATE',
    'ASUTIME',
    'AT',
    'AUDIT',
    'AUX',
    'AUXILIARY',
    'BEFORE',
    'BEGIN',
    'BETWEEN',
    'BUFFERPOOL',
    'BY',
    'CAPTURE',
    'CASCADED',
    'CASE',
    'CAST',
    'CCSID',
    'CHARACTER',
    'CHECK',
    'CLONE',
    'CLUSTER',
    'COLLECTION',
    'COLLID',
    'COLUMN',
    'CONDITION',
    'CONNECTION',
    'CONSTRAINT',
    'CONTENT',
    'CONTINUE',
    'CREATE',
    'CUBE',
    'CURRENT',
    'CURRENT_DATE',
    'CURRENT_LC_CTYPE',
    'CURRENT_PATH',
    'CURRENT_SCHEMA',
    'CURRENT_TIME',
    'CURRENT_TIMESTAMP',
    'CURRVAL',
    'CURSOR',
    'DATA',
    'DATABASE',
    'DBINFO',
    'DECLARE',
    'DEFAULT',
    'DESCRIPTOR',
    'DETERMINISTIC',
    'DISABLE',
    'DISALLOW',
    'DISTINCT',
    'DO',
    'DOCUMENT',
    'DSSIZE',
    'DYNAMIC',
    'EDITPROC',
    'ENCODING',
    'ENCRYPTION',
    'ENDING',
    'END-EXEC',
    'ERASE',
    'ESCAPE',
    'EXCEPTION',
    'EXISTS',
    'EXIT',
    'EXTERNAL',
    'FENCED',
    'FIELDPROC',
    'FINAL',
    'FIRST',
    'FOR',
    'FREE',
    'FULL',
    'FUNCTION',
    'GENERATED',
    'GET',
    'GLOBAL',
    'GOTO',
    'GROUP',
    'HANDLER',
    'HOLD',
    'HOURS',
    'IF',
    'IMMEDIATE',
    'IN',
    'INCLUSIVE',
    'INDEX',
    'INHERIT',
    'INNER',
    'INOUT',
    'INSENSITIVE',
    'INTO',
    'IS',
    'ISOBID',
    'ITERATE',
    'JAR',
    'KEEP',
    'KEY',
    'LANGUAGE',
    'LAST',
    'LC_CTYPE',
    'LEAVE',
    'LIKE',
    'LOCAL',
    'LOCALE',
    'LOCATOR',
    'LOCATORS',
    'LOCK',
    'LOCKMAX',
    'LOCKSIZE',
    'LONG',
    'LOOP',
    'MAINTAINED',
    'MATERIALIZED',
    'MICROSECONDS',
    'MINUTEMINUTES',
    'MODIFIES',
    'MONTHS',
    'NEXT',
    'NEXTVAL',
    'NO',
    'NONE',
    'NOT',
    'NULL',
    'NULLS',
    'NUMPARTS',
    'OBID',
    'OF',
    'OLD',
    'ON DELETE',
    'ON UPDATE',
    'OPTIMIZATION',
    'OPTIMIZE',
    'ORDER',
    'ORGANIZATION',
    'OUT',
    'OUTER',
    'PACKAGE',
    'PARAMETER',
    'PART',
    'PADDED',
    'PARTITION',
    'PARTITIONED',
    'PARTITIONING',
    'PATH',
    'PIECESIZE',
    'PERIOD',
    'PLAN',
    'PRECISION',
    'PREVVAL',
    'PRIOR',
    'PRIQTY',
    'PRIVILEGES',
    'PROCEDURE',
    'PROGRAM',
    'PSID',
    'PUBLIC',
    'QUERY',
    'QUERYNO',
    'READS',
    'REFERENCES',
    'RESIGNAL',
    'RESTRICT',
    'RESULT',
    'RESULT_SET_LOCATOR',
    'RETURN',
    'RETURNS',
    'ROLE',
    'ROLLUP',
    'ROUND_CEILING',
    'ROUND_DOWN',
    'ROUND_FLOOR',
    'ROUND_HALF_DOWN',
    'ROUND_HALF_EVEN',
    'ROUND_HALF_UP',
    'ROUND_UP',
    'ROW',
    'ROWSET',
    'SCHEMA',
    'SCRATCHPAD',
    'SECONDS',
    'SECQTY',
    'SECURITY',
    'SEQUENCE',
    'SENSITIVE',
    'SESSION_USER',
    'SIMPLE',
    'SOME',
    'SOURCE',
    'SPECIFIC',
    'STANDARD',
    'STATIC',
    'STATEMENT',
    'STAY',
    'STOGROUP',
    'STORES',
    'STYLE',
    'SUMMARY',
    'SYNONYM',
    'SYSDATE',
    'SYSTEM',
    'SYSTIMESTAMP',
    'TABLE',
    'TABLESPACE',
    'THEN',
    'TO',
    'TRIGGER',
    'TYPE',
    'UNDO',
    'UNIQUE',
    'UNTIL',
    'USER',
    'VALIDPROC',
    'VARIABLE',
    'VARIANT',
    'VCAT',
    'VERSIONING',
    'VIEW',
    'VOLATILE',
    'VOLUMES',
    'WHILE',
    'WLM',
    'XMLEXISTS',
    'XMLCAST',
    'YEARS',
    'ZONE',
  ],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=utilities-db2-online
  onlineUtilies: [
    'BACKUP SYSTEM',
    'CATENFM',
    'CATMAINT',
    'CHECK DATA',
    'CHECK INDEX',
    'CHECK LOB',
    'COPY',
    'COPYTOCOPY',
    'DIAGNOSE',
    'EXEC SQL',
    'LISTDEF',
    'LOAD',
    'MERGECOPY',
    'MODIFY RECOVERY',
    'MODIFY STATISTICS',
    'OPTIONS',
    'QUIESCE',
    'REBUILD INDEX',
    'RECOVER',
    'REORG INDEX',
    'REORG TABLESPACE',
    'REPAIR',
    'REPORT',
    'RESTORE SYSTEM',
    'RUNSTATS',
    'STOSPACE',
    'TEMPLATE',
    'UNLOAD',
  ],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=db2-commands
  commands: [
    'ABEND',
    'ACCESS DATABASE',
    'ALTER BUFFERPOOL',
    'ALTER GROUPBUFFERPOOL',
    'ALTER UTILITY',
    'ARCHIVE LOG',
    'BIND PACKAGE',
    'BIND PLAN',
    'BIND QUERY',
    'BIND SERVICE',
    'BIND',
    'REBIND',
    'CANCEL THREAD',
    'DCLGEN',
    'DISPLAY ACCEL',
    'DISPLAY ARCHIVE',
    'DISPLAY BLOCKERS',
    'DISPLAY BUFFERPOOL',
    'DISPLAY DATABASE',
    'DISPLAY DDF',
    'DISPLAY FUNCTION SPECIFIC',
    'DISPLAY GROUP',
    'DISPLAY GROUPBUFFERPOOL',
    'DISPLAY LOCATION',
    'DISPLAY LOG',
    'DISPLAY PROCEDURE',
    'DISPLAY PROFILE',
    'DISPLAY RLIMIT',
    'DISPLAY RESTSVC',
    'DISPLAY THREAD',
    'DISPLAY TRACE',
    'DISPLAY UTILITY',
    'DSN',
    'DSNH',
    'END',
    'FREE PACKAGE',
    'FREE PLAN',
    'FREE QUERY',
    'FREE SERVICE',
    'MODIFY admtproc,APPL=SHUTDOWN',
    'MODIFY admtproc,APPL=TRACE',
    'MODIFY DDF',
    'MODIFY irlmproc,ABEND',
    'MODIFY irlmproc,DIAG',
    'MODIFY irlmproc,PURGE',
    'MODIFY irlmproc,SET',
    'MODIFY irlmproc,STATUS',
    'MODIFY TRACE',
    'REBIND PACKAGE',
    'REBIND PLAN',
    'REBIND TRIGGER PACKAGE',
    'RECOVER BSDS',
    'RECOVER INDOUBT',
    'RECOVER POSTPONED',
    'REFRESH DB2,EARLY',
    'RESET GENERICLU',
    'RESET INDOUBT',
    'RUN',
    'SET ARCHIVE',
    'SET LOG',
    'SET SYSPARM',
    'SPUFI',
    'START ACCEL',
    'START admtproc',
    'START CDDS',
    'START DATABASE',
    'START DB2',
    'START DDF',
    'START FUNCTION SPECIFIC',
    'START irlmproc',
    'START PROCEDURE',
    'START PROFILE',
    'START RLIMIT',
    'START RESTSVC',
    'START TRACE',
    'STOP ACCEL',
    'STOP admtproc',
    'STOP CDDS',
    'STOP DATABASE',
    'STOP DB2',
    'STOP DDF',
    'STOP FUNCTION SPECIFIC',
    'STOP irlmproc',
    'STOP PROCEDURE',
    'STOP PROFILE',
    'STOP RLIMIT',
    'STOP RESTSVC',
    'STOP TRACE',
    'TERM UTILITY',
    'TRACE CT',
  ],
};

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
// https://www.ibm.com/docs/en/db2-for-zos/11?topic=statements-list-supported
const reservedCommands = [
  'ALLOCATE CURSOR',
  'ALTER DATABASE',
  'ALTER FUNCTION',
  'ALTER INDEX',
  'ALTER MASK',
  'ALTER PERMISSION',
  'ALTER PROCEDURE',
  'ALTER SEQUENCE',
  'ALTER STOGROUP',
  'ALTER TABLE',
  'ALTER TABLESPACE',
  'ALTER TRIGGER',
  'ALTER TRUSTED CONTEXT',
  'ALTER VIEW',
  'ASSOCIATE LOCATORS',
  'BEGIN DECLARE SECTION',
  'CALL',
  'CLOSE',
  'COMMENT',
  'COMMIT',
  'CONNECT',
  'CREATE ALIAS',
  'CREATE AUXILIARY TABLE',
  'CREATE DATABASE',
  'CREATE FUNCTION',
  'CREATE GLOBAL TEMPORARY TABLE',
  'CREATE INDEX',
  'CREATE LOB TABLESPACE',
  'CREATE MASK',
  'CREATE PERMISSION',
  'CREATE PROCEDURE',
  'CREATE ROLE',
  'CREATE SEQUENCE',
  'CREATE STOGROUP',
  'CREATE SYNONYM',
  'CREATE TABLE',
  'CREATE TABLESPACE',
  'CREATE TRIGGER',
  'CREATE TRUSTED CONTEXT',
  'CREATE TYPE',
  'CREATE VARIABLE',
  'CREATE VIEW',
  'DECLARE CURSOR',
  'DECLARE GLOBAL TEMPORARY TABLE',
  'DECLARE STATEMENT',
  'DECLARE TABLE',
  'DECLARE VARIABLE',
  'DELETE',
  'DESCRIBE CURSOR',
  'DESCRIBE INPUT',
  'DESCRIBE OUTPUT',
  'DESCRIBE PROCEDURE',
  'DESCRIBE TABLE',
  'DROP',
  'END DECLARE SECTION',
  'EXCHANGE',
  'EXECUTE',
  'EXECUTE IMMEDIATE',
  'EXPLAIN',
  'FETCH',
  'FREE LOCATOR',
  'GET DIAGNOSTICS',
  'GRANT',
  'HOLD LOCATOR',
  'INCLUDE',
  'INSERT',
  'LABEL',
  'LOCK TABLE',
  'MERGE',
  'OPEN',
  'PREPARE',
  'REFRESH',
  'RELEASE',
  'RELEASE SAVEPOINT',
  'RENAME',
  'REVOKE',
  'ROLLBACK',
  'SAVEPOINT',
  'SELECT',
  'SELECT INTO',
  'SET CONNECTION',
  'SET',
  'SET CURRENT ACCELERATOR',
  'SET CURRENT APPLICATION COMPATIBILITY',
  'SET CURRENT APPLICATION ENCODING SCHEME',
  'SET CURRENT DEBUG MODE',
  'SET CURRENT DECFLOAT ROUNDING MODE',
  'SET CURRENT DEGREE',
  'SET CURRENT EXPLAIN MODE',
  'SET CURRENT GET_ACCEL_ARCHIVE',
  'SET CURRENT LOCALE LC_CTYPE',
  'SET CURRENT MAINTAINED TABLE TYPES FOR OPTIMIZATION',
  'SET CURRENT OPTIMIZATION HINT',
  'SET CURRENT PACKAGE PATH',
  'SET CURRENT PACKAGESET',
  'SET CURRENT PRECISION',
  'SET CURRENT QUERY ACCELERATION',
  'SET CURRENT QUERY ACCELERATION WAITFORDATA',
  'SET CURRENT REFRESH AGE',
  'SET CURRENT ROUTINE VERSION',
  'SET CURRENT RULES',
  'SET CURRENT SQLID',
  'SET CURRENT TEMPORAL BUSINESS_TIME',
  'SET CURRENT TEMPORAL SYSTEM_TIME',
  'SET ENCRYPTION PASSWORD',
  'SET PATH',
  'SET SCHEMA',
  'SET SESSION TIME ZONE',
  'SIGNAL',
  'TRUNCATE',
  'UPDATE',
  'VALUES',
  'VALUES INTO',
  'WHENEVER',
  // other
  'ADD',
  'ALTER COLUMN', // verify
  'AFTER',
  'DROP TABLE', // verify
  'FETCH FIRST',
  'FROM',
  'GROUP BY',
  'GO',
  'HAVING',
  'INSERT INTO',
  'LIMIT',
  'OFFSET',
  'ORDER BY',
  'SELECT',
  'SET CURRENT SCHEMA',
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
  'NATURAL JOIN',
];

/**
 * Priority 3
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['WHEN', 'ELSE', 'ELSEIF'];

// https://www.ibm.com/support/knowledgecenter/en/ssw_ibm_i_72/db2/rbafzintro.htm
export default class Db2Formatter extends Formatter {
  static reservedCommands = reservedCommands;
  static reservedBinaryCommands = reservedBinaryCommands;
  static reservedDependentClauses = reservedDependentClauses;
  static reservedJoinConditions = ['ON', 'USING'];
  static reservedLogicalOperators = ['AND', 'OR'];
  static fullReservedWords = dedupe([
    ...Object.values(reservedFunctions).reduce((acc, arr) => [...acc, ...arr], []),
    ...Object.values(reservedKeywords).reduce((acc, arr) => [...acc, ...arr], []),
  ]);

  static stringTypes: StringPatternType[] = [`""`, "''", '``', '[]', "x''"];
  static blockStart = ['('];
  static blockEnd = [')'];
  static indexedPlaceholderTypes = ['?'];
  static namedPlaceholderTypes = [':'];
  static lineCommentTypes = ['--'];
  static specialWordChars = { any: '#@' };
  static operators = ['**', '!>', '!<', '||'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands: Db2Formatter.reservedCommands,
      reservedBinaryCommands: Db2Formatter.reservedBinaryCommands,
      reservedDependentClauses: Db2Formatter.reservedDependentClauses,
      reservedJoinConditions: Db2Formatter.reservedJoinConditions,
      reservedLogicalOperators: Db2Formatter.reservedLogicalOperators,
      reservedKeywords: Db2Formatter.fullReservedWords,
      stringTypes: Db2Formatter.stringTypes,
      blockStart: Db2Formatter.blockStart,
      blockEnd: Db2Formatter.blockEnd,
      indexedPlaceholderTypes: Db2Formatter.indexedPlaceholderTypes,
      namedPlaceholderTypes: Db2Formatter.namedPlaceholderTypes,
      lineCommentTypes: Db2Formatter.lineCommentTypes,
      specialWordChars: Db2Formatter.specialWordChars,
      operators: Db2Formatter.operators,
    });
  }
}