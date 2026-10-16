import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';

/* ================================================================
 * Types publics
 * ================================================================ */

/** Les six faces possibles du dé. */
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Positionnement du dé par rapport à son conteneur.
 * Les valeurs courantes sont proposées en autocomplétion, mais
 * n'importe quelle chaîne est acceptée (voir `placementStyle`).
 */
export type DicePlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

/** Ce que le parent peut piloter via une ref. */
export interface Dice3DHandle {
  /** Lance le dé. `forcedValue` court-circuite l'aléatoire. */
  rollDice: (forcedValue?: DiceValue) => void;
}

/**
 * Props du composant.
 *
 * On hérite de `ButtonHTMLAttributes` pour accepter tout attribut DOM
 * valide sur le `<button>` (id, aria-*, data-*, title…), en retirant
 * ceux qu'on redéfinit avec un sens différent.
 */
export interface Dice3DProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'defaultValue' | 'value' | 'children'
  > {
  /** Durée de l'animation de lancer, en ms. @default 1000 */
  rollingTime?: number;
  /** Appelé quand le dé se stabilise, avec la face obtenue. */
  onRoll?: (value: DiceValue) => void;
  /** Face affichée au premier rendu (mode non contrôlé). @default 6 */
  defaultValue?: DiceValue;
  /** Arête du cube en pixels. @default 250 */
  size?: number;
  /** Couleur de fond des faces (ignorée si une image est fournie). */
  faceBg?: string;
  /** Images des faces, dans l'ordre 1→6. Une entrée vide = face par défaut. */
  faces?: string[];
  /** Force la face obtenue au prochain lancer (triche / tests). */
  cheatValue?: DiceValue;
  /** Ancrage du dé, ex. `"top-left"`. */
  placement?: DicePlacement;
  /** URL d'un son joué pendant le lancer. */
  sound?: string;
  /** Touches déclenchant le lancer, plus `"click"`. @default ['click'] */
  triggers?: string[];
  /**
   * Face affichée en mode contrôlé. Fournir cette prop bascule le
   * composant en contrôlé : il n'avancera plus tout seul.
   */
  value?: DiceValue;
  /** Appelé à chaque stabilisation — sert à synchroniser `value`. */
  onValueChange?: (value: DiceValue) => void;
}

/* ================================================================
 * CSS — injecté une seule fois pour toute l'application.
 * Idéalement, déplace-le dans un vrai fichier .css importé ici.
 * ================================================================ */

const DICE_CSS = `
._space3d {
  perspective: 1000px;
  text-align: center;
  display: inline-block;
  padding: unset;
  border: unset;
  background-color: transparent;
  outline: unset;
  box-shadow: unset;
}
._space3d ._3dbox {
  display: inline-block;
  transition: all 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-align: center;
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateX(-90deg) rotateY(0deg) rotateZ(0deg);
}
._space3d ._3dface {
  overflow: hidden;
  position: absolute;
  opacity: 1;
  background-size: auto 100%;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
._space3d .defaultFace {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-radius: 12px;
  box-shadow: inset 0 0 6px #000000;
  background-color: #fff;
}
._space3d .defaultFace div {
  display: flex;
  align-items: center;
  justify-content: center;
}
._space3d .defaultFace span {
  width: 60%;
  height: 60%;
  box-shadow: 0 0 6px #000000;
  border-radius: 50%;
  background-color: #000;
}
._space3d.one   ._3dbox { transform: rotateX(90deg)  rotateY(0deg)   rotateZ(0deg); }
._space3d.two   ._3dbox { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
._space3d.three ._3dbox { transform: rotateX(0deg)   rotateY(180deg) rotateZ(0deg); }
._space3d.four  ._3dbox { transform: rotateX(-90deg) rotateY(90deg)  rotateZ(90deg); }
._space3d.five  ._3dbox { transform: rotateX(90deg)  rotateY(-90deg) rotateZ(90deg); }
/* Pas de règle ".six" : la transform par défaut de ._3dbox EST la face 6. */
._space3d.rolling ._3dbox {
  transform-style: preserve-3d;
  animation: spin 2s infinite linear;
}
@keyframes spin {
  0%   { transform: translateZ(-100px) rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
  16%  { transform: translateZ(-100px) rotateX(180deg) rotateY(180deg) rotateZ(0deg); }
  33%  { transform: translateZ(-100px) rotateX(360deg) rotateY(90deg)  rotateZ(180deg); }
  50%  { transform: translateZ(-100px) rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
  66%  { transform: translateZ(-100px) rotateX(180deg) rotateY(360deg) rotateZ(270deg); }
  83%  { transform: translateZ(-100px) rotateX(270deg) rotateY(180deg) rotateZ(180deg); }
  100% { transform: translateZ(-100px) rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
}
`;

let cssInjected = false;

function injectDiceCSS(): void {
  if (cssInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.setAttribute('type', 'text/css');
  tag.textContent = DICE_CSS;
  document.head.appendChild(tag);
  cssInjected = true;
}

/* ================================================================
 * Tables statiques — au niveau module, références stables à vie.
 * ================================================================ */

const VALUE_TO_CLASS: Record<DiceValue, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
};

const FACE_TRANSFORM: Record<DiceValue, (half: number) => CSSProperties> = {
  1: (half) => ({ transform: `rotateX(-90deg) translate3d(0, 0, ${half}px)` }),
  2: (half) => ({ transform: `translate3d(0, 0, ${half}px)` }),
  3: (half) => ({ transform: `rotateY(180deg) translate3d(0, 0, ${half}px)` }),
  4: (half) => ({
    left: '50%',
    marginLeft: `-${half}px`,
    transform: `rotateY(-90deg) translate3d(0, 0, ${half}px)`,
  }),
  5: (half) => ({
    left: '50%',
    marginLeft: `-${half}px`,
    transform: `rotateY(90deg) translate3d(0, 0, ${half}px)`,
  }),
  6: (half) => ({ transform: `rotateX(90deg) translate3d(0, 0, ${half}px)` }),
};

/** Cellules allumées sur la grille 5×5, par face. */
const PIPS: Record<DiceValue, readonly number[]> = {
  1: [12],
  2: [11, 13],
  3: [6, 12, 18],
  4: [6, 8, 16, 18],
  5: [6, 8, 12, 16, 18],
  6: [6, 8, 11, 13, 16, 18],
};

const FACE_CLASSNAMES: readonly string[] = [
  '_3dface _3dface--one',
  '_3dface _3dface--two',
  '_3dface _3dface--three',
  '_3dface _3dface--four',
  '_3dface _3dface--five',
  '_3dface _3dface--six',
];

const GRID_CELLS: readonly number[] = Array.from({ length: 25 }, (_, i) => i);

const DICE_VALUES: readonly DiceValue[] = [1, 2, 3, 4, 5, 6];

function isDiceValue(input: number): input is DiceValue {
  return (DICE_VALUES as readonly number[]).includes(input);
}

/* ================================================================
 * Face par défaut (les points). Mémoïsée.
 * ================================================================ */

interface DefaultFaceProps {
  faceNumber: DiceValue;
}

const DefaultFace = memo(function DefaultFace({ faceNumber }: DefaultFaceProps) {
  const activePips = PIPS[faceNumber];

  return (
    <div className={`defaultFace ${VALUE_TO_CLASS[faceNumber]}`}>
      {GRID_CELLS.map((cell) => (
        <div key={cell}>{activePips.includes(cell) ? <span /> : null}</div>
      ))}
    </div>
  );
});

/* ================================================================
 * Composant principal
 * ================================================================ */

const Dice3D = forwardRef<Dice3DHandle, Dice3DProps>(
  function Dice3D(props, ref) {
    const {
      rollingTime = 1000,
      onRoll,
      defaultValue = 6,
      size = 250,
      faceBg,
      faces,
      disabled = false,
      cheatValue,
      placement,
      sound,
      triggers = ['click'],
      value,
      onValueChange,
      className,
      style,
      onClick,
      ...rest
    } = props;

    /* --- Mode contrôlé / non contrôlé --- */
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<DiceValue>(defaultValue);
    const displayedValue: DiceValue = isControlled ? value : internalValue;

    const [rolling, setRolling] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /* --- Refs « dernière valeur connue » : gardent rollDice stable
           sans le recréer quand le parent passe une nouvelle closure. --- */
    const onRollRef = useRef<Dice3DProps['onRoll']>(onRoll);
    const onValueChangeRef = useRef<Dice3DProps['onValueChange']>(onValueChange);

    useEffect(() => {
      onRollRef.current = onRoll;
    }, [onRoll]);

    useEffect(() => {
      onValueChangeRef.current = onValueChange;
    }, [onValueChange]);

    /* --- Injection CSS, une fois pour toute l'app --- */
    useEffect(() => {
      injectDiceCSS();
    }, []);

    /* --- Nettoyage au démontage --- */
    useEffect(
      () => () => {
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      },
      []
    );

    /* --- Lancer le dé --- */
    const rollDice = useCallback(
      (forcedValue?: DiceValue) => {
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);

        if (sound) {
          const audio = new Audio(sound);
          audioRef.current = audio;
          // play() renvoie une promesse : on ignore un éventuel blocage autoplay.
          void audio.play().catch(() => undefined);
        }

        setRolling(true);

        timeoutRef.current = setTimeout(() => {
          let next: DiceValue = (Math.floor(Math.random() * 6) + 1) as DiceValue;
          if (forcedValue !== undefined) next = forcedValue;
          if (cheatValue !== undefined) next = cheatValue;

          setRolling(false);
          // En mode contrôlé, cet état interne est ignoré à l'affichage :
          // c'est le parent qui décide via `value`.
          setInternalValue(next);

          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }

          onValueChangeRef.current?.(next);
          onRollRef.current?.(next);
        }, rollingTime);
      },
      [rollingTime, sound, cheatValue]
    );

    useImperativeHandle(ref, () => ({ rollDice }), [rollDice]);

    /* --- Triggers : clé primitive pour éviter les réabonnements --- */
    const triggersKey = Array.isArray(triggers) ? triggers.join('|') : '';

    const triggersList = useMemo<string[]>(
      () => (Array.isArray(triggers) ? triggers : []),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [triggersKey]
    );

    useEffect(() => {
      if (typeof window === 'undefined' || triggersList.length === 0) {
        return undefined;
      }

      const handleKeyPress = (event: KeyboardEvent): void => {
        if (triggersList.includes(event.key)) rollDice();
      };

      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }, [triggersList, rollDice]);

    /* --- Faces : clé primitive, immunise contre les nouvelles
           identités de tableau passées par le parent. --- */
    const facesKey = Array.isArray(faces) ? faces.join('|') : '';

    const facesList = useMemo<string[]>(
      () => (Array.isArray(faces) ? faces : []),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [facesKey]
    );

    const faceElements = useMemo(() => {
      const half = size / 2;

      return FACE_CLASSNAMES.map((faceClassName, index) => {
        const imageUrl = facesList[index];
        const faceNumber = (index + 1) as DiceValue;

        return (
          <div
            key={faceClassName}
            className={faceClassName}
            style={{
              ...FACE_TRANSFORM[faceNumber](half),
              width: `${size}px`,
              height: `${size}px`,
              ...(faceBg ? { backgroundColor: faceBg } : {}),
              ...(imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}),
            }}
          >
            {imageUrl ? null : <DefaultFace faceNumber={faceNumber} />}
          </div>
        );
      });
    }, [size, faceBg, facesList]);

    /* --- Styles dérivés --- */
    const placementStyle = useMemo<CSSProperties>(() => {
      if (!placement) return {};

      const result: Record<string, string | number> = {};
      for (const token of placement.split('-')) {
        result[token] = token === 'left' || token === 'right' ? 0 : `-${size}px`;
      }
      return result as CSSProperties;
    }, [placement, size]);

    const buttonStyle = useMemo<CSSProperties>(
      () => ({
        ...placementStyle,
        ...style,
        width: `${size}px`,
        height: `${size}px`,
        filter: disabled ? 'grayscale(100%)' : 'unset',
      }),
      [placementStyle, style, size, disabled]
    );

    const isClickTrigger = triggersList.includes('click');

    const rootClassName = [
      '_space3d',
      VALUE_TO_CLASS[displayedValue],
      rolling ? 'rolling' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        type="button"
        {...rest}
        disabled={disabled || rolling}
        onClick={(event) => {
          onClick?.(event);
          if (isClickTrigger) rollDice();
        }}
        style={buttonStyle}
        className={rootClassName}
      >
        <div className="_3dbox">{faceElements}</div>
      </button>
    );
  }
);

export default Dice3D;
export { Dice3D };