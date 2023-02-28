import express from 'express';
const app = express()
import fetch from 'node-fetch';
import jsdom from 'jsdom';

const parseHTML = (htmlString) => {
    const doc = new jsdom.JSDOM(htmlString);
    return doc;
}

const tableToJson = (table) => {
    const headers = [];
    const headerElements = table.getElementsByTagName('th');
    for (let i = 0; i < headerElements.length; i++) {
        headers.push(headerElements[i].textContent.trim().toLowerCase());
    }

    const rows = [];
    const rowElements = table.getElementsByTagName('tr');
    for (let i = 0; i < rowElements.length; i++) {
        const row = {};
        const cellElements = rowElements[i].getElementsByTagName('td');
        for (let j = 0; j < cellElements.length; j++) {
            row[headers[j]] = cellElements[j].textContent.split('\n')[0] || cellElements[j].querySelector('img')?.src;
        }
        rows.push(row);
    }

    return rows;
}

app.get('/cota/:id', function (req, res) {
    fetch(`https://www.cepea.esalq.usp.br/br/indicador/${req.params.id}.aspx`)
        .then(data => data.text())
        .then(d => res.json(tableToJson(parseHTML(d).window.document.querySelector('table')).filter(e => JSON.stringify(e) !== '{}').map(e => ({...e, dailyVariation: e["var./dia"], monthlyVariation: e["var./mês"], realValue: e["valor r$*"], dollarValue: e["valor us$*"], date: e[""]}))))
})

app.listen(3000)