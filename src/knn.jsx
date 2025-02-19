import ChampionDict from "./ChampionDict.jsx";
import JSZip from 'jszip';

const reverseChampionDict = Object.keys(ChampionDict).reduce((acc, key) => {
    const value = ChampionDict[key];
    acc[value] = key;
    return acc;
}, {});

// Function to calculate Euclidean distance between two users based on ratings
function euclideanDistance(ratings1, ratings2) {
    let sum = 0;
    for (let i = 0; i < ratings1.length; i++) {
        sum += Math.pow(ratings1[i] - ratings2[i], 2); // squared differences
    }
    return Math.sqrt(sum); // square root of the sum
}

// Function to get the k nearest neighbors based on Euclidean distance
function getNearestNeighbors(targetUser, k) {
    return new Promise((resolve, reject) => {

        fetch('/data.zip')
            .then(response => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error(`Failed to fetch zip file: ${response.statusText}`);
                }
                // Convert the response into an ArrayBuffer for binary data
                return response.arrayBuffer();
            })
            // Load the zip using JSZip
            .then(arrayBuffer => JSZip.loadAsync(arrayBuffer))
            .then(zip => {
                // Extract the file named "data.bit" from the zip archive
                const file = zip.file("data.bit");
                if (!file) {
                    throw new Error("data.bit not found in zip archive");
                }
                // Return the file's contents as an ArrayBuffer
                return file.async("arraybuffer");
            })
            .then(buffer => {
                const dataView = new DataView(buffer);
                const numElements = buffer.byteLength / 4;

                let values = [];

                for (let i = 0; i < numElements; i++) {
                    const floatValue = dataView.getFloat32(i * 4, true);
                    values.push(floatValue);
                }

                // Group the values into arrays of 169 elements
                const groupedValues = [];
                const groupSize = 169;
                for (let i = 0; i < values.length; i += groupSize) {
                    const group = values.slice(i, i + groupSize);
                    groupedValues.push(group);
                }

                // Calculate the distances once the data is processed
                const distances = groupedValues.map(user => {
                    return {
                        user: user,
                        distance: euclideanDistance(targetUser, user)
                    };
                });

                // Sort the users by distance (ascending order)
                distances.sort((a, b) => a.distance - b.distance);

                // Resolve the Promise with the k nearest neighbors
                resolve(distances.slice(0, k).map(item => item.user));
            })
            .catch(error => reject('Error loading file:', error));  // Catch any errors that occur during fetching or processing
    });
}

// Function to generate recommendations based on nearest neighbors
function generateRecommendations(query, neighbors, num) {

    // Filter out items the target user has already rated
    const unratedItemsMask = Array(169).fill(true); // Initialize all items as unrated

    // Mark the rated items as false
    query.forEach(item => {
        unratedItemsMask[ChampionDict[item[0]] -1] = false;
    });

    // Calculate the average rating of similar users for unrated items
    const suggestions = [];

    for (let i = 0; i < neighbors[0].length; i++) {  // Loop through all genres (or items)
        if (unratedItemsMask[i]) {  // If this genre/item is unrated by the target user
            const avgRating = neighbors.reduce((sum, rating) => sum + rating[i], 0) / neighbors.length;
            suggestions.push({ index: reverseChampionDict[i + 1], rating: avgRating });
        }
    }

    // Sort the suggestions based on the average rating
    suggestions.sort((a, b) => b.rating - a.rating); // Sort in descending order of ratings

    // Recommend top N items
    return suggestions.slice(0, num);
}

export {getNearestNeighbors, generateRecommendations};