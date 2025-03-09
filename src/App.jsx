import './App.css'
import {useEffect, useRef, useState} from "react";
import axios from 'axios';

import {ChampionCard} from "./ChampionCard/ChampionCard.jsx";
import {ChampionIcon} from "./ChampionIcon/ChampionIcon.jsx";
import {getNearestNeighbors, generateRecommendations} from "./knn";
import {createQuery, translateId, normalizeArray, getMasteryFromUser} from "./AuxFunctions.jsx";

function App() {

    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputFilled, setInputFilled] = useState(false);
    const [mastery, setMastery] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [championsCounter, setChampionsCounter] = useState([0, 1, 2, 3]);
    const isUpdating = useRef([false, false, false]);

    const handleNameChange = (event) => {

        setPlayerName(event.target.value);
    }

    const handleSend = () => {

        const preprocessQuery = (query, numMastery) => {

            const array = [];
            for(let counter=0; counter < numMastery; counter++){

                array.push([query[counter].championId, query[counter].championLevel]);
            }

            return array
        }

        setLoading(true);

        const input = playerName.split(" ");
        const inputPlayerTag = input.pop();
        const inputPlayerName = input.join(" ");

        axios.get(`https://riot-api-proxy.bernardotameirao.workers.dev/?playerName=${inputPlayerName}&playerTag=${inputPlayerTag}`)
            .then((response) => {

                setMastery(preprocessQuery(response.data, 3));

            }).catch((error) =>{
                console.log(error);
                setLoading(false);
        })
    }

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
                    //todo: suggestions.length
                // if (newState[3] + 1 === suggestions.length) {
                if (newState[3] + 1 === 4) {

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
            setLoading(false);
            setInputFilled(true);  // Set `inputFilled` to true only after `suggestions` has changed
        }
    }, [suggestions]);

    return (
        <div className="background">
            <div className="center-div">
                <div className="center-div-row-text">
                    <h1 className="center-div-text1">Hermes</h1>
                    {/*<div className="vertical-line"/>*/}
                    <h2 className="center-div-text2">Recommendation<br/>System</h2>
                </div>
                <div className="center-div-content">
                    { !inputFilled ? (
                        <div className="center-div-content-text">
                            <h2 className="center-div-text3">Discover new champions to your liking based on your preferences</h2>
                            <div className="input-container">
                                <input type="text" placeholder="Player Username" className="input-custom"
                                       value={playerName}
                                       onChange={handleNameChange}/>
                                <button onClick={handleSend} className="input-button">
                                    {!loading ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="11" cy="11" r="8"/>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                        </svg>
                                    ) : (
                                        <div className="spinner"/>
                                    )
                                    }
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="center-div-text3">Based on your 3 greatest masteries:</h2>
                            <div className="center-div-content-icons">
                                <ChampionIcon champion={translateId(mastery[0])}/>
                                <ChampionIcon champion={translateId(mastery[1])}/>
                                <ChampionIcon champion={translateId(mastery[2])}/>
                            </div>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App
