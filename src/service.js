'use strict'

const db = require('./db');

class Service {
    constructor() {
        this.onLoad = db.init();
        this.pool = db.pool;
    }

    async getAllGoods() {
        try {
            const goods = await this.pool.query('SELECT * FROM goods');
            return goods.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllWarehouses() {
        try {
            const warehouses = await this.pool.query('SELECT * FROM warehouses');
            return warehouses.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllEquipment() {
        try {
            const equipment = await this.pool.query('SELECT * FROM equipment');
            return equipment.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllWarehousesEquipment() {
        try {
            const record = await this.pool.query(
                `SELECT warehouses.name, warehouses.address, model 
                FROM warehouses
                LEFT JOIN warehouse_equipment ON warehouses.id = warehouse_id
                LEFT JOIN equipment ON equipment.id = equipment_id
                ORDER BY warehouses.id`
            );
            return record.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllWarehousesLoad(date) {
        try {
            const record = await this.pool.query(
                `SELECT name, address, area, capacity, SUM(volume) AS load_volume, (SUM(volume) / capacity * 100) AS load_percent
                FROM (
                    SELECT move_to AS wh, SUM(units * unit_volume) as volume
                    FROM goods_in_move
                    JOIN goods ON id = goods_id
                    WHERE arrival <= CAST ($1 AS DATE)
                    GROUP BY move_to
                    UNION ALL
                    SELECT move_from AS wh, SUM(units * unit_volume * -1) as volume
                    FROM goods_in_move
                    JOIN goods ON id = goods_id
                    WHERE departure < CAST ($1 AS DATE)
                    GROUP BY move_from
                )
                RIGHT JOIN warehouses ON wh = warehouses.id
                GROUP BY name, address, area, capacity`,
                [date]
            );
            return record.rows;
        } catch (err) {
            return err;
        }
    }

    async getAllWarehousesTraficStats(start, end) {
        try {
            const record = await this.pool.query(
                `SELECT name, address, area, capacity,
                    SUM(import_volume) AS import_volume,
                    SUM(export_volume) AS export_volume,
                    SUM(import_supplies) AS import_supplies,
                    SUM(export_supplies) AS export_supplies
                FROM (
                    SELECT move_to AS wh,
                        SUM(units * unit_volume) AS import_volume,
                        NULL AS export_volume,
                        COUNT(move_to) AS import_supplies,
                        NULL AS export_supplies
                    FROM goods_in_move
                    JOIN goods ON id = goods_id
                    WHERE arrival >= CAST ($1 AS DATE) AND 
                        arrival <= CAST ($2 AS DATE) AND
                        move_to IS NOT NULL
                    GROUP BY move_to
                    UNION ALL
                    SELECT move_from AS wh,
                        NULL AS import_volume,
                        SUM(units * unit_volume) AS export_volume,
                        NULL AS import_supplies,
                        COUNT(move_from) AS export_supplies
                    FROM goods_in_move
                    JOIN goods ON id = goods_id
                    WHERE departure >= CAST ($1 AS DATE) AND 
                        departure <= CAST ($2 AS DATE) AND
                        move_from IS NOT NULL
                    GROUP BY move_from
                )
                RIGHT JOIN warehouses ON wh = warehouses.id
                GROUP BY name, address, area, capacity`,
                [start, end]
            );
            return record.rows;
        } catch (err) {
            return err;
        }
    }

    async getWarehouseTraficLog(name, start, end) {
        try {
            const record = await this.pool.query(
                `SELECT goods.name AS goods,
                    units,
                    (units * unit_volume) AS volume,
                    (units * unit_weight) AS weight,
                    package,
                    import.name AS move_from,
                    export.name AS move_to,
                    departure,
                    arrival
                FROM goods_in_move
                JOIN goods ON goods_id = goods.id
                LEFT JOIN warehouses AS export ON export.id = move_to
                LEFT JOIN warehouses AS import ON import.id = move_from
                WHERE (export.name = $1 OR import.name = $1) AND
                    arrival >= CAST ($2 AS DATE) AND
                    arrival <= CAST ($3 AS DATE) AND
                    departure >= CAST ($2 AS DATE) AND
                    departure <= CAST ($3 AS DATE)
                    `,
                [name, start, end]
            );
            return record.rows;
        } catch (err) {
            return err;
        }
    }

    async getGoodsTraficLog(name) {
        try {
            const formatedName = name.replace(/_/g, ' ');
            const record = await this.pool.query(
                `SELECT goods.name AS goods,
                    units,
                    (units * unit_volume) AS volume,
                    (units * unit_weight) AS weight,
                    package,
                    import.name AS move_from,
                    export.name AS move_to,
                    departure,
                    arrival
                FROM goods_in_move
                JOIN goods ON goods_id = goods.id
                LEFT JOIN warehouses AS export ON export.id = move_to
                LEFT JOIN warehouses AS import ON import.id = move_from
                WHERE goods.name = $1
                `,
                [formatedName]
            );
            return record.rows;
        } catch (err) {
            return err;
        }
    }
}

module.exports = new Service();
