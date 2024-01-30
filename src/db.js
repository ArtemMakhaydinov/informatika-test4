'use strict'

const { Pool } = require('pg');

class DBConnection {
    constructor() {
        this.pool = this.connect();
    }

    connect() {
        const pool = new Pool({
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
            database: process.env.PG_DB_NAME,
        });

        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });

        return pool;
    }

    async init() {
        const client = await this.pool.connect();
        try {
            await client.query(
                `CREATE TABLE IF NOT EXISTS goods(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(256) NOT NULL,
                    measure_unit VARCHAR(256) NOT NULL,
                    unit_weight NUMERIC NOT NULL,
                    unit_volume NUMERIC NOT NULL,
                    package VARCHAR
                )`
            );

            await client.query(
                `CREATE TABLE IF NOT EXISTS warehouses(
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(256) NOT NULL,
                    address VARCHAR(256) NOT NULL,
                    area NUMERIC NOT NULL,
                    capacity NUMERIC NOT NULL
                )`
            );

            await client.query(
                `CREATE TABLE IF NOT EXISTS equipment(
                    id SERIAL PRIMARY KEY,
                    model VARCHAR(256) NOT NULL
                )`
            );

            await client.query(
                `CREATE TABLE IF NOT EXISTS warehouse_equipment(
                    warehouse_id INTEGER NOT NULL,
                    equipment_id INTEGER NOT NULL,
                    FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE CASCADE,
                    FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE
                )`
            );

            await client.query(
                `CREATE TABLE IF NOT EXISTS goods_in_move(
                    goods_id INTEGER NOT NULL,
                    units NUMERIC NOT NULL,
                    departure DATE,
                    arrival DATE,
                    move_from INTEGER,
                    move_to INTEGER,
                    FOREIGN KEY (goods_id) REFERENCES goods (id) ON DELETE CASCADE,
                    FOREIGN KEY (move_from) REFERENCES warehouses (id) ON DELETE CASCADE,
                    FOREIGN KEY (move_to) REFERENCES warehouses (id) ON DELETE CASCADE
                )`
            );

        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new DBConnection();
