import dedent from 'dedent-js';

import { FormatFn } from 'src/sqlFormatter';

type Options = { without?: string[]; additionally?: string[], keepJoinInFromClause?: boolean };

export default function supportsJoin(
  format: FormatFn,
  { without, additionally, keepJoinInFromClause }: Options = {}
) {
  const unsupportedJoinRegex = without ? new RegExp(without.join('|'), 'u') : /^whateve_!%&$/u;
  const isSupportedJoin = (join: string) => !unsupportedJoinRegex.test(join);
  const keepJoinInFromClauseDefined = typeof keepJoinInFromClause !== 'undefined';

  ['CROSS JOIN', 'NATURAL JOIN'].filter(isSupportedJoin).forEach(join => {
    it(`supports ${join}`, () => {
      const result = format(
        `SELECT * FROM tbl1 ${join} tbl2`,
        keepJoinInFromClauseDefined ? { keepJoinInFromClause } : undefined
      );

      let expected = dedent`
        SELECT
          *
        FROM
          tbl1
          ${join} tbl2
        `;
      if (keepJoinInFromClauseDefined && !keepJoinInFromClause) {
        expected = dedent`
          SELECT
            *
          FROM
            tbl1
          ${join} tbl2
        `;
      }

      expect(result).toBe(expected);
    });
  });

  // <join> ::= [ <join type> ] JOIN
  //
  // <join type> ::= INNER | <outer join type> [ OUTER ]
  //
  // <outer join type> ::= LEFT | RIGHT | FULL

  [
    'JOIN',
    'INNER JOIN',
    'LEFT JOIN',
    'LEFT OUTER JOIN',
    'RIGHT JOIN',
    'RIGHT OUTER JOIN',
    'FULL JOIN',
    'FULL OUTER JOIN',
    ...(additionally || []),
  ]
    .filter(isSupportedJoin)
    .forEach(join => {
      it(`supports ${join}`, () => {
        const result = format(
          `SELECT * FROM customers
          ${join} orders ON customers.customer_id = orders.customer_id
          ${join} items USING (item_id, name);`,
          keepJoinInFromClauseDefined ? { keepJoinInFromClause } : undefined
        );

        let expected = dedent`
          SELECT
            *
          FROM
            customers
            ${join} orders ON customers.customer_id = orders.customer_id
            ${join} items USING (item_id, name);
        `;
        if (keepJoinInFromClauseDefined && !keepJoinInFromClause) {
          expected = dedent`
            SELECT
              *
            FROM
              customers
            ${join} orders
            ON customers.customer_id = orders.customer_id
            ${join} items
            USING (item_id, name);
          `;
        }

        expect(result).toBe(expected);
      });
    });
}
