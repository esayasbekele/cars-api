const rp = require('request-promise');
const Boom = require('boom');

const searchInternal = function (request, reply) {
    let payload = request.payload;
    const body = {
        size: payload.limit || 10,
        from: payload.offset || 0,
        query: {
            bool: {
                must: [{ match_all: {} }]
            }
        },
        aggs: {}
    };
    if (payload.searchText) {
        body.query.bool.must.push(
            {
                match: {
                    full_text: {
                        query: payload.searchText,
                        operator: "and"
                    }
                }
            });
    }
    const filters = payload.filters;
    if (filters) {
        body.post_filter = { bool: { must: []} };
        for (let filterKey in filters) {
            body.aggs[filterKey] = { filter: { bool : { must: [] } }, aggs: {} };
            body.aggs[filterKey].aggs[filterKey] = { terms: { size: 100, field: filterKey } };
        }
        for (let filter in filters) {
            let facetFilter = { terms: {} };
            facetFilter.terms[filter] = [];
            if (!filters[filter] || filters[filter].length === 0) {
                facetFilter = { match_all: {} };
            }
            for (let filterValueKey in filters[filter]) {
                facetFilter.terms[filter].push(filters[filter][filterValueKey]);
            }
            body.post_filter.bool.must.push(facetFilter);
            for (let agg in body.aggs) {
                if (agg !== filter) {
                    body.aggs[agg].filter.bool.must.push(facetFilter);
                }
            }
        }
    }
    const options = {
        method: 'POST',
        body: body,
        json: true,
        uri: 'http://localhost:9200/cars/_search'
    };
    rp(options).then(function (data) {
        return reply(data);
    }).catch(function (error) {
        console.log(error);
        return reply(Boom.badImplementation());
    })
};

const search = {
    method: 'POST',
    path: '/',
    handler: searchInternal
};
module.exports = [search];