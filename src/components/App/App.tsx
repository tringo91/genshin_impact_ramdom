import { Component, createSignal, For, JSX } from 'solid-js';
import styles from './App.module.css';

import { Card } from '../Card';
import { Button } from '../Button';
import { Container } from '../Container';
import { Filters } from '../Filters';
import { characters } from '../../data/characters';
import {
  filterElements,
  filterRarity,
  selectedCharacters,
  setSelectedCharacters,
} from '../../data/store';
import { GenshinCharacter, GenshinElement } from '../../types/types';
import { shuffle } from '../../utils/utils'; 

const idToCard =
  (offset: number = 0, className: String = '', onClick: (param: number) => void, id: GenshinCharacter['id'], index: number) => {
    let indexCard = index + offset;
    const handleClick = (param: number) => {
      onClick(param);
    };
    return (
      <Card
        className={className}
        index={indexCard}
        onClick={() => handleClick(indexCard)}
        character={characters.find(c => c.id === id)}
      />
    );
  }

const App = () => {
  const [teams, setTeams] = createSignal<GenshinCharacter['id'][]>([]);
  const [staticTeam, setStaticTeam] = createSignal<GenshinCharacter['id'][]>([
    0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const [positionCard, setPositionCard] = createSignal<Number>(8);
  const areAllCharatersSelected = () =>
    selectedCharacters.selectedCharacters.length === characters.length;
  const team1 = () => Array.from({ length: 4 }, (_, i) => teams()[i]);
  const team2 = () => Array.from({ length: 4 }, (_, i) => teams()[i + 4]);
  const generateTeams = () => {
    const rnd = shuffle(Array.from(selectedCharacters.selectedCharacters));
    setTeams(() => {
      let team = staticTeam();
      const newTeam: GenshinCharacter['id'][] = [];
      rnd.slice(0, 8).map((value, index) => {
        if(team[index] === 0){
          newTeam.push(value);
        } else {
          newTeam.push(team[index]);
        }
      });
      return newTeam
    });
  };

  const handleClickTeam = (index: number) => {
    setPositionCard(index);
  }

  return (
    <>
      <header class={styles.header}>
        <a
          href="https://github.com/Pustur/genshin-impact-team-randomizer"
          target="_blank"
        >
          GitHub
        </a>
        <a
          class={styles.try}
          href="https://spiralabyss.genshinteams.online"
          target="_blank"
        >
          Randomizer with Preset Teams
        </a>
      </header>
      <main>
        <h1 class={styles.title}>Genshin Impact -- Đại Đế Dộng -- Randomizer</h1>
        <img src='/img/meme.png' style={{ 'margin': 'auto'}} height={'150px'} />
        <div class={styles.teams}>
          <div class={`${styles.grid} ${styles.team}`}>
            {team1().map((id, index) => {
              let className = '';
              if(index == positionCard().valueOf()){
                className = 'cardChooseCharacter'
              } else if(staticTeam()[index] !== 0){
                className = 'cardPickedCharacter'
              }
              return idToCard(0, className, handleClickTeam, id, index)
            })}
          </div>
          <div class={`${styles.grid} ${styles.team}`}>
            {team2().map((id, index) => {
              let className = '';
              if((index + 4) == positionCard().valueOf()){
                className = 'cardChooseCharacter'
              } else if(staticTeam()[index + 4] !== 0){
                className = 'cardPickedCharacter'
              }
              return idToCard(4, className, handleClickTeam, id, index)
            })}
          </div>
        </div>
        <div class={styles.buttons}>
          <Button
            secondary
            onClick={() =>{
                setTeams([]);
                setPositionCard(8);
                setStaticTeam([0,0,0,0,0,0,0,0])
                setSelectedCharacters(state => ({
                  ...state,
                  selectedCharacters: areAllCharatersSelected()
                    ? []
                    : characters.map(c => c.id),
                }))
              }
            }
          >
            {areAllCharatersSelected() ? 'Deselect' : 'Clear'} all
          </Button>
          <Button onClick={generateTeams}>Generate teams</Button>
        </div>
        <Container>
          <Filters />
        </Container>
        <div class={`${styles.grid} ${styles.mainGrid}`}>
          <For
            each={characters.filter(
              character =>
                (filterElements.length === 0 ||
                  filterElements.some(elem =>
                    character.elements.includes(elem as GenshinElement),
                  )) &&
                (filterRarity.length === 0 ||
                  filterRarity.includes(character.stars)),
            )}
          >
            {character => (
              <Card
                type={'InteractiveCard'}
                onClick={() => {
                  let staticTeamTemp = staticTeam();
                  setSelectedCharacters(state => {
                    if (state.selectedCharacters.includes(character.id) || staticTeamTemp.includes(character.id)) {
                      return {
                        ...state,
                        selectedCharacters: [
                          ...state.selectedCharacters.filter(
                            selected => selected !== character.id,
                          ),
                        ],
                      };
                    }
                    return {
                      ...state,
                      selectedCharacters: [
                        ...state.selectedCharacters,
                        character.id,
                      ],
                    };
                  });
                  let posi = positionCard().valueOf();
                  if(posi >= 0 && posi < 8 && !staticTeamTemp.includes(character.id)){
                    setStaticTeam(() => {
                      staticTeamTemp[posi] = character.id;
                      return staticTeamTemp;
                    });
                    setTeams(() => {
                      const newTeam: GenshinCharacter['id'][] = [];
                      let temp = teams();
                      if(typeof temp[posi] === 'undefined'){
                        temp = [0,0,0,0,0,0,0,0];
                      }
                      temp[posi] = character.id;
                      temp.map((value) => {
                        newTeam.push(value)
                      })
                      return newTeam;
                    });
                    setPositionCard(8);
                  }
                }}
                character={character}
              />
            )}
          </For>
        </div>
      </main>
    </>
  );
};

export { App };
