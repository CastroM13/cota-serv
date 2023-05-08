import express from 'express';
const app = express()
import fetch from 'node-fetch';
import jsdom from 'jsdom';
import cors from 'cors';

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

app.use(cors())

app.get('/cota/:id', function (req, res) {
    fetch(`https://www.cepea.esalq.usp.br/br/indicador/${req.params.id}.aspx`)
        .then(data => data.text())
        .then(d => res.json(tableToJson(parseHTML(d).window.document.querySelector('table')).filter(e => JSON.stringify(e) !== '{}').map(e => ({...e, dailyVariation: e["var./dia"], monthlyVariation: e["var./mês"], realValue: e["valor r$*"], dollarValue: e["valor us$*"], date: e[""]}))))
})

app.get('/cotas', (req, res) => {
    fetch(`https://www.cepea.esalq.usp.br/br`)
        .then(data => data.text())
        .then(d => res.json(Array.from(parseHTML(d).window.document.querySelector('.imagenet-seg-menu-indicador').children).map(i => ({title: i.children[0].text, url: i.children[0].href})).filter(x => x.url.includes('indicador')).map(y => ({...y, tag: y.url.split('https://www.cepea.esalq.usp.br/br/indicador/')[1].split('.aspx')[0]}))))
})

app.get('/dolar', (req, res) => {
    fetch(`https://dolarhoje.com/`)
        .then(data => data.text())
        .then(d => res.json(parseFloat(parseHTML(d).window.document.querySelector('#nacional').value.replace(",", "."))))
})

app.listen(3000)