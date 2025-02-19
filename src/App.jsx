import './App.css'
import {useEffect, useRef, useState} from "react";
import axios from 'axios';

import {ChampionCard} from "./ChampionCard/ChampionCard.jsx";
import {getNearestNeighbors, generateRecommendations} from "./knn";
import {createQuery, translateId, normalizeArray, getMasteryFromUser} from "./AuxFunctions.jsx";

function App() {

    const [playerName, setPlayerName] = useState('');
    const [playerTag, setPlayerTag] = useState('');
    const [inputFilled, setInputFilled] = useState(false);
    const [mastery, setMastery] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [championsCounter, setChampionsCounter] = useState([0, 1, 2, 3]);

    const handleNameChange = (whichInput) => (event) => {

        switch(whichInput) {

            case 0:
                setPlayerName(event.target.value);
                break;

            case 1:
                setPlayerTag(event.target.value);
                break;

            default:
                break;
        }
    }

    const handleSend = () => {

        const preprocessQuery = (query, numMastery) => {

            const array = [];
            for(let counter=0; counter < numMastery; counter++){

                array.push([query[counter].championId, query[counter].championLevel]);
            }

            return array
        }

        axios.get(`https://riot-api-proxy.bernardotameirao.workers.dev/?playerName=${playerName}&playerTag=${playerTag}`)
            .then((response) => {

                setMastery(preprocessQuery(response.data, 3));

            }).catch((error) =>{
            console.log(error);
        })
    }

    const isUpdating = useRef([false, false, false]);
    const updatePosition = (index)  => {

        if(isUpdating.current[index]){

            return;
        }

        isUpdating.current[index] = true;
        setTimeout(() => {

            setChampionsCounter(prevState => {
                // Create a new array with the updated value
                const newState = [...prevState];
                newState[index] = newState[3];

                if (newState[3] + 1 === suggestions.length) {

                    newState[3] = 0;
                    return newState;
                }

                newState[3] += 1;
                return newState;
            });
            isUpdating.current[index] = false;

        }, 450);
    };

    useEffect(() => {

        const fetchData = async () => {
            if (mastery) {
                const query = createQuery(normalizeArray(getMasteryFromUser(mastery)), mastery);

                try {
                    // Wait for the result of getNearestNeighbors
                    const neighbours = await getNearestNeighbors(query, 50);

                    // Use the result to generate suggestions
                    setSuggestions(generateRecommendations(mastery, neighbours, 20));
                } catch (error) {
                    console.error('Error fetching nearest neighbors:', error);
                }

            }
        };

        fetchData();
    }, [mastery]); // Dependency array ensures this runs only when `mastery` changes

    useEffect(() => {
        if (suggestions) {
            setInputFilled(true);  // Set `inputFilled` to true only after `suggestions` has changed
        }
    }, [suggestions]);

    return (
        <div className="background">
            <div className="center-div">
                <h1>Recommendation System</h1>
                <div className="center-div-content">
                    { !inputFilled ? (
                        <>
                            <div className="center-div-content-text">
                                <div className="input-container">
                                    <input type="text" placeholder="Player Username" className="input-custom" value={playerName}
                                           onChange={handleNameChange(0)} />
                                </div>
                                <div className="input-container">
                                    <input type="text" placeholder="Player Tag" className="input-custom" value={playerTag}
                                           onChange={handleNameChange(1)} />
                                </div>
                            </div>
                            <button onClick={handleSend}>Send</button>
                        </>
                        ) : (
                            <div className="center-div-content-cards">
                                <div onClick={() => updatePosition(0)}>
                                <ChampionCard champion={translateId(suggestions[championsCounter[0]].index)}
                                              champion2={translateId(suggestions[championsCounter[3]].index)}/>
                                </div>
                                <div onClick={() => updatePosition(1)}>
                                <ChampionCard champion={translateId(suggestions[championsCounter[1]].index)}
                                              champion2={translateId(suggestions[championsCounter[3]].index)}/>
                                </div>
                                <div onClick={() => updatePosition(2)}>
                                <ChampionCard champion={translateId(suggestions[championsCounter[2]].index)}
                                              champion2={translateId(suggestions[championsCounter[3]].index)}/>
                                </div>
                            </div>
                        )
                    }
                </div>
          </div>
        </div>
    )
}

export default App
