class ORM {
    constructor(db) {
        this.db = db;
    }

    /**
     * Function returns rows of db table or null value if an error is occurred
     * @param {string} table A table name
     * @param {string} fileds 
     * @param {object} condition conditions @example { id: 2 }
     * @param {string} operator
     * @param {object} limitParams number of rows which will return @example { limit: 100, offset: 0 }
     * @param {object} orderBy table name @example { order: 'id', reverse: false }
     * @return {Promise<object[] | null>}
     */
    async select(
        table,
        fileds = '*',
        condition,
        operator = 'AND',
        limitParams,
        orderBy,
    ) {
        let index = 0;
        let conditions;
        let values = [];
        if(condition) {
            conditions = Object.keys(condition).map(key => {
                index += 1;
                return `${key}=$${index}`;
            }).join(` ${operator} `);
            values = Object.values(condition);
        }
        const query = `
            SELECT ${fileds}
            FROM ${table}
            ${conditions ? `WHERE ${conditions}` : ''}
            ${
                orderBy ? 
                    `ORDER BY ${orderBy.order} 
                    ${
                        orderBy.reverse ? 'DESC' : ''
                    }` 
                : ''
            }
            ${
                limitParams ?
                    `LIMIT ${limitParams.limit}
                    OFFSET ${limitParams.offset}`
                : ''
            }
        `;
        let response = null;
        try {
            response = (await this.db.query(query, values)).rows;
        } catch (e) { console.log("error:", e.detail || e.hint) };
        return response;
    }

    /**
     * Function that updates values from a table
     * @param {string} table A table name
     * @param {object} update columns of the table that you want to update @example { id: 2, name: 'alex' }
     * @param {object} conditions the conditions by wich the table is filtered @example { guid: '1234-52565' }
     * @param {string} operator a boolean operator "AND" is default
     * @return {Promise<true | null>} return updated row
     */
    async update(
        table, 
        update = {}, 
        conditions, 
        operator = 'AND'
    ) {
        let index = 0;
        let condition;
        const params = Object.keys(update).map(key => {
            index += 1;
            return `${key}=$${index}`;
        }).join(', ');
        let values = Object.values(update);
        if(conditions) {
            condition = Object.keys(conditions).map(key => {
                index += 1;
                return ` ${key}=$${index} `;
            }).join(operator);
            values = values.concat(Object.values(conditions));
        }
        const query = `
            UPDATE ${table} 
            SET ${params} 
            ${conditions ? `WHERE ${condition}` : ''}
        `;
        let response = null;
        try {
            response = await this.db.query(query, values);
        } catch (e) { console.log("error:", e.detail || e.hint) };
        return response;
    }

    /**
     * Function adds new row in the table
     * @param {string} table a table name
     * @param {object} params params you want to add @example { name: 'alex', id: 1 }
     * @param {array} returning array of keys you need to function return
     * @return {Promise<boolean>} 'true' means that new row has been added in table
     */
    async insert (table, params = {}, returning) {
        const keys = Object.keys(params).join(', ');
        const values = Object.values(params);
        const indexedValues = values.map((value, index) => value=`$${index+1}`).join(', ');
        const query = `
            INSERT INTO ${table} (${keys})
            VALUES(${indexedValues})
            ${ returning ? `RETURNING ${ returning.join(', ') }` : '' }
        `;
        let response = null;
        try {
            response = (await this.db.query(query, values))?.rows;
        } catch (e) { console.log("error:", e.detail || e.hint) };
        return response;
    }

    /**
     * Function that delete rows from the table
     * @param {string} table a table name 
     * @param {object} params parameters by wwich you`re looking for right rows
     * @param {string} operator a boolean operator "AND" is default
     * @returns 
     */
    async delete(table, params = {}, operator = 'AND') {
        const values = Object.values(params);
        const condition = Object.keys(params).map((key, index) => ` ${key} = ${index+1} `).join(operator);
        const query = `DELETE FROM ${table} WHERE ${condition}`;
        let response = null;
        try {
            response = await this.db.query(query, values);
        } catch (e) { console.log("error:", e.detail || e.hint) };
        return response;
    }
}

module.exports = ORM;