import ChampionDict from "./ChampionDict.jsx";
import championsJson from "./ChampionCard/champions.json";

const champions = Object.values(championsJson.data);

function createQuery(values, position) {

    const query = Array(169).fill(0);

    for(let counter=0; counter<values.length; counter++) {

        const aux = ChampionDict[position[counter][0]] - 1;
        query[aux] = values[counter];
    }

    return query;
}

function translateId(targetKey) {

    const match = champions.find(champion => champion.key === targetKey);
    return match.id;
}

function normalizeArray(arr) {
    const min = 1;
    const max = 1064;
    return arr.map(num => (num - min) / (max - min));
}

function getMasteryFromUser(user) {
    let masteryList = [];

    for (const element of user) {
        masteryList.push(element[1]);
    }

    return masteryList;
}

function preprocessQuery(query, numMastery) {

    const array = [];
    for(let counter=0; counter < numMastery; counter++){

        array.push([query[counter].championId, query[counter].championLevel]);
    }

    return array
}

export {createQuery, translateId, normalizeArray, getMasteryFromUser, preprocessQuery};