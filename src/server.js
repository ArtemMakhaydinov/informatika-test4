'use strict'

require('dotenv').config();
const http = require('node:http');
const service = require('./service');

const PORT = process.env.PORT || 3000;

const routing = {
    '/': `<a href = "/goods"> <span>All goods</span> </a> </br>
        <a href = "/equipment"> <span>All equipment</span> </a> </br>
        <a href = "/warehouses"> <span>All warehouses</span> </a> </br>
        <a href = "/warehouses/equipment"> <span>All warehouses' equipment</span> </a> </br>
        <a href = "/warehouses/load?date=2007-09-03"> <span>All warehouses info and workload on 2007-09-03</span> </a> </br>
        <a href = "/warehouses/trafic?start=2007-09-01&end=2007-09-05"> <span>All warehouses trafic between 2007-09-01 and 2007-09-05</span> </a> </br>
        <a href = "/warehouse/trafic?name=SH&start=2007-09-01&end=2007-09-05"> <span>SH warehouse trafic log between 2007-09-01 and 2007-09-05</span> </a> </br>
        <a href = "/goods/trafic?name=Genco_olive_oil"> <span>Log of all movements of "Genco olive oil"</span> </a> </br>
        `,
    '/goods': async () => await service.getAllGoods(),
    '/warehouses': async () => await service.getAllWarehouses(),
    '/equipment': async () => await service.getAllEquipment(),
    '/warehouses/equipment': async () => await service.getAllWarehousesEquipment(),
    '/warehouses/load': async (params) => await service.getAllWarehousesLoad(params.date),
    '/warehouses/trafic': async (params) => await service.getAllWarehousesTraficStats(params.start, params.end),
    '/warehouse/trafic': async (params) => await service.getWarehouseTraficLog(params.name, params.start, params.end),
    '/goods/trafic': async (params) => await service.getGoodsTraficLog(params.name),
    '/api/goods': async () => await service.getAllGoods(),
    '/api/warehouses': async () => await service.getAllWarehouses(),
    '/api/equipment': async () => await service.getAllEquipment(),
    '/api/warehouses/equipment': async () => await service.getAllWarehousesEquipment(),
    '/api/warehouses/load': async (params) => await service.getAllWarehousesLoad(params.date),
    '/api/warehouses/trafic': async (params) => await service.getAllWarehousesTraficStats(params.start, params.end),
    '/api/warehouse/trafic': async (params) => await service.getWarehouseTraficLog(params.name, params.start, params.end),
    '/api/goods/trafic': async (params) => await service.getGoodsTraficLog(params.name),
};

const types = {
    string: (s) => s,
    function: (fn, params) => fn(params),
    undefined: () => 'Not found.',
};

const HTMLtableBuilder = (data) => {
    const keys = Object.keys(data[0]);
    let htmlString = '<table><tr>';
    for (const key of keys) {
        htmlString += `<th>${key}</th>`
    };

    htmlString += '</tr>'
    for (const record of data) {
        htmlString += '<tr>';
        for (const key of keys) {
            htmlString += `<td>${record[key]}</td>`
        };
        htmlString += '</tr>';
    };

    htmlString += '</table>';
    return htmlString;
};

const getQueryParams = (url) => {
    const params = {};
    try{
        if (url.includes('?')) {
            const paramsString = url.split('?')[1];
            paramsString.split('&')
                .forEach(param => {
                    const[key, value] = param.split('=');
                    params[key] = value;
                });
        };
    } catch (err) {
        return {};
    }
    return params;
}

const router = async (req, res) => {
    const url = req.url.split('?')[0];
    const isApi = url.split('/')[1] === 'api';
    const params = getQueryParams(req.url);
    const route = routing[url];
    const type = typeof route;
    const serializer = types[type];
    const data = await serializer(route, params);
    if (isApi || data instanceof Error) return JSON.stringify(data);
    if (typeof data !== 'object') return data;
    if (!data.length) return 'Not found.';
    return HTMLtableBuilder(data);
};

http.createServer(async (req, res) => {
    const data = await router(req, res);
    res.end(data);
}).listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
