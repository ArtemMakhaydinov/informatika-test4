'use strict'

require('dotenv').config();
const db = require('./src/db');

const goods = [
    {
        name: 'Wonka chocolate bar',
        measure_unit: 'Box',
        unit_weight: 7,
        unit_volume: 0.1,
        pack: 'Cardboard box',
    },
    {
        name: 'Genco olive oil',
        measure_unit: 'Can',
        unit_weight: 3,
        unit_volume: 0.03,
        pack: 'Metal can',
    },
    {
        name: 'Red Apple sigarettes',
        measure_unit: 'Box',
        unit_weight: 5.5,
        unit_volume: 0.2,
        pack: 'Cardboard box',
    },
];

const warehouses = [
    {
        name: 'SH',
        address: '221B Baker Street, London',
        area: 200,
        capacity: 800,
    },
    {
        name: 'HP',
        address: 'Number 4 Privet Drive, Little Whinging',
        area: 100,
        capacity: 420,
    },
    {
        name: 'JB',
        address: '30 Wellington Square, London',
        area: 500,
        capacity: 2500,
    },
    {
        name: 'DW',
        address: '76 Totter\'s Lane, London',
        area: 20,
        capacity: 140,
    },
];

const equipment = [
    'Flying Ford Anglia',
    'Aston Martin DB5',
    'DeLorean DMC-12',
    'WALL-E',
];

const warehouse_equipment = [
    {
        warehouse_id: 0,
        equipment_id: 0,
    },
    {
        warehouse_id: 0,
        equipment_id: 2,
    },
    {
        warehouse_id: 1,
        equipment_id: 3,
    },
    {
        warehouse_id: 1,
        equipment_id: 0,
    },
    {
        warehouse_id: 2,
        equipment_id: 1,
    },
    {
        warehouse_id: 2,
        equipment_id: 1,
    },
];

const goods_in_move = [
    {
        goods_id: 0,
        units: 20,
        departure: '2007-09-01',
        arrival: '2007-09-03',
        move_to: 0,
    },
    {
        goods_id: 0,
        units: 8,
        departure: '2007-09-01',
        arrival: '2007-09-03',
        move_to: 1,
    },
    {
        goods_id: 0,
        units: 37,
        departure: '2007-09-01',
        arrival: '2007-09-03',
        move_to: 2,
    },
    {
        goods_id: 1,
        units: 900,
        departure: '2007-09-01',
        arrival: '2007-09-02',
        move_to: 2,
    },
    {
        goods_id: 1,
        units: 300,
        departure: '2007-09-03',
        arrival: '2007-09-05',
        move_from: 2,
        move_to: 0,
    },
    {
        goods_id: 1,
        units: 140,
        departure: '2007-09-06',
        move_from: 2,
        move_to: 1,
    },
    {
        goods_id: 1,
        units: 550,
        departure: '2007-09-02',
        arrival: '2007-09-06',
        move_to: 2,
    },
    {
        goods_id: 2,
        units: 300,
        departure: '2007-09-01',
        arrival: '2007-09-03',
        move_to: 0,
    },
    {
        goods_id: 2,
        units: 300,
        departure: '2007-09-05',
        arrival: '2007-09-06',
        move_from: 0,
        move_to: 2,
    },
    {
        goods_id: 2,
        units: 120,
        departure: '2007-09-07',
        move_from: 2,
        move_to: 0,
    },
]

const createRecords = async (goods, warehouses, equipment, warehouse_equipment, goods_in_move) => {
    const { pool } = db;
    const client = await pool.connect();
    const goodsIds = [];
    const warehousesIds = [];
    const equipmentIds = [];
    for (const good of goods) {
        const { name, measure_unit, unit_weight, unit_volume, pack } = good;
        const record = await client.query(
            `INSERT INTO goods (name, measure_unit, unit_weight, unit_volume, package)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, measure_unit, unit_weight, unit_volume, pack]
        );

        console.log(record.rows[0]);
        goodsIds.push(record.rows[0].id);
    };

    for (const warehouse of warehouses) {
        const { name, address, area, capacity } = warehouse;
        const record = await client.query(
            `INSERT INTO warehouses (name, address, area, capacity)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [name, address, area, capacity]
        );

        console.log(record.rows[0]);
        warehousesIds.push(record.rows[0].id);
    };

    for (const model of equipment) {
        const record = await client.query(
            `INSERT INTO equipment (model)
            VALUES ($1)
            RETURNING *`,
            [model]
        );

        console.log(record.rows[0]);
        equipmentIds.push(record.rows[0].id);
    };

    for (const wh_eq of warehouse_equipment) {
        const warehousesId = warehousesIds[wh_eq.warehouse_id];
        const equipmentId = equipmentIds[wh_eq.equipment_id];
        const record = await client.query(
            `INSERT INTO warehouse_equipment (warehouse_id, equipment_id)
            VALUES ($1, $2)
            RETURNING *`,
            [warehousesId, equipmentId]
        );

        console.log(record.rows[0]);
    };
    
    for (const good_in_move of goods_in_move){
        const goodId = goodsIds[good_in_move.goods_id];
        const moveFrom = warehousesIds[good_in_move.move_from];
        const moveTo = warehousesIds[good_in_move.move_to];
        const { units, departure, arrival } = good_in_move;
        const record = await client.query(
            `INSERT INTO goods_in_move (goods_id, units, departure, arrival, move_from, move_to)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [goodId, units, departure, arrival, moveFrom, moveTo]
        );

        console.log(record.rows[0]);
    };

    client.release();
};

const init = async () => {
    const { pool } = db;
    try {
        await db.init();
        await createRecords(goods, warehouses, equipment, warehouse_equipment, goods_in_move);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

init();
