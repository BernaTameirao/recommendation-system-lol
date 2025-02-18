import './ChampionCard.css'
import {useState} from "react";

function ChampionCard({ champion, champion2 }) {

    const urlChampion = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion}_0.jpg`;
    const urlChampion2 = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion2}_0.jpg`;

    const [isAnimating, setIsAnimating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {

        setIsAnimating(true);
    }

    const handleAnimationEnd = () => {

        setIsAnimating(false);
    }

    const handleMouseEnter = () => {

        setIsHovered(true);
    }

    const handleMouseLeave = () => {

        setIsHovered(false);
    }

    return (
        <div className="champion-card">
            <div className="card">
                <img src={urlChampion2} alt="Champion Card"/>
                <div className={`card-2 ${isAnimating ? "animation-up" : ""}`}
                     onClick={handleClick}
                     onAnimationEnd={handleAnimationEnd}
                     onMouseEnter={handleMouseEnter}
                     onMouseLeave={handleMouseLeave}>
                    <img src={urlChampion} alt="Champion Card"/>

                </div>
            </div>
            <h2 className={`card-text ${isHovered ? "card-text-show" : ""}`}>{champion}</h2>
        </div>
    )
}

export {ChampionCard}