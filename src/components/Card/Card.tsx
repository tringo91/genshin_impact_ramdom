import {
  Component,
  ParentComponent,
  createSignal,
  JSX,
  onMount,
  createEffect,
} from 'solid-js';

import styles from './Card.module.css';
import { nextFrame, shuffle, slugify } from '../../utils/utils';
import { GenshinCharacter } from '../../types/types';
import { selectedCharacters } from '../../data/store';

interface ICard {
  type?: String | undefined;
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined;
  character?: GenshinCharacter;
  index?: number;
  className?: String | null;
}

type IShellCard = Pick<ICard, 'index' | 'onClick' | 'className'>;

type IDisplayCard = ICard & Required<Pick<ICard, 'character'>>;

type IInteractiveCard = Required<Pick<ICard, 'character' | 'onClick'>>;

const ShellCard: ParentComponent<IShellCard> = props => {
  const [isMounted, setIsMounted] = createSignal(false);

  onMount(() => nextFrame(() => setIsMounted(true)));
  
  return (
    <button
      onClick={props.onClick}
      style={{ '--card-transition-delay': `${(props.index ?? 0) * 100}ms` }}
      class={`${styles.card} ${styles.selected} ${styles.transition} ${props.className == 'cardChooseCharacter' ? styles.cardChooseCharacter : (props.className == 'cardPickedCharacter' ?  styles.cardPickedCharacter : '')}`}
      classList={{
        [styles.animate]: isMounted(),
      }}
    >
      {props.children}
    </button>
  );
};

const EmptyCard: Component = () => {
  return (
    <>
      <div class={styles.imageHolder}>
        <img class={styles.emptyImage} src="/img/icons/empty.svg" alt="" />
      </div>
      <div class={styles.name}>--</div>
    </>
  );
};

const DisplayCard: Component<IDisplayCard> = props => {
  const element = () => {
    if (props.character.elements.length === 1) {
      return props.character.elements[0];
    }
    return shuffle(Array.from(props.character.elements)).slice(0, 1);
  };

  return (
    <>
      <div
        class={styles.imageHolder}
        classList={{
          [styles.fourStar]: props.character.stars === 4,
          [styles.fiveStar]: props.character.stars === 5,
          [styles.collab]: props.character.collab,
        }}
        title={props.character.fullName}
      >
        <img
          class={styles.characterImage}
          src={`/img/characters/${slugify(props.character.fullName)}.png`}
          alt=""
        />
      </div>
      <div class={styles.elementsContainer}>
        <img
          class={styles.element}
          src={`/img/elements/${element()}.svg`}
          alt=""
        />
      </div>
      <div class={styles.name}>{props.character.fullName}</div>
    </>
  );
};

const InteractiveCard: Component<IInteractiveCard> = props => {
  return (
    <button
      class={styles.card}
      classList={{
        [styles.selected]: selectedCharacters.selectedCharacters.includes(
          props.character.id,
        ),
      }}
      onClick={props.onClick}
      title={props.character.fullName}
    >
      <div
        class={styles.imageHolder}
        classList={{
          [styles.fourStar]: props.character.stars === 4,
          [styles.fiveStar]: props.character.stars === 5,
          [styles.collab]: props.character.collab,
        }}
      >
        <img
          class={styles.characterImage}
          src={`/img/characters/${slugify(props.character.fullName)}.png`}
          alt=""
        />
      </div>
      <div class={styles.elementsContainer}>
        {props.character.elements.map(element => (
          <img
            class={styles.element}
            src={`/img/elements/${element}.svg`}
            alt=""
          />
        ))}
      </div>
      <div class={styles.name}>{props.character.fullName}</div>
    </button>
  );
};

const Card: Component<ICard> = props => {
    if(props.character){
      if (!props.type) {
        return (
          <ShellCard onClick={props?.onClick} index={props.index} className={props?.className}>
            <DisplayCard character={props.character} />
          </ShellCard>
        );
      } else if(props?.type === 'InteractiveCard' && props.onClick){
        return (
          <InteractiveCard onClick={props?.onClick} character={props.character} />
        );
      }
    } else {
      return (
        <ShellCard onClick={props?.onClick} index={props.index} className={props?.className}>
          <EmptyCard />
        </ShellCard>
      );
    }
};

export { Card };
