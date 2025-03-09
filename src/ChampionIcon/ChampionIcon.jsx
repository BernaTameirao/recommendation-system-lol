import './ChampionIcon.css';

function ChampionIcon({ champion }) {

    const urlChampion = `https://ddragon.leagueoflegends.com/cdn/15.5.1/img/champion/${champion}.png`;

    return (
            <div className="champion-icon">
                <img src={urlChampion} alt="Champion Icon"/>
            </div>
    )
}

export {ChampionIcon}