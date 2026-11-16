import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";

/* ================================================================
 * Public types
 * ================================================================ */

/** The six possible faces of the die. */
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Positioning of the die relative to its container.
 * Common values are offered in autocomplete, but
 * any string is accepted (see `placementStyle`).
 */
export type DicePlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

/** What the parent can control via a ref. */
interface Dice3DHandle {
  /** Rolls the die. `forcedValue` bypasses the randomness. */
  rollDice: (forcedValue?: DiceValue) => void;
}

/**
 * Component props.
 *
 * We extend `ButtonHTMLAttributes` to accept any valid DOM
 * attribute on the `<button>` (id, aria-*, data-*, title…), while removing
 * the ones we redefine with a different meaning.
 */
interface Dice3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Duration of the roll animation, in ms. @default 1000 */
  rollingTime?: number;
  /** Called when the die settles, with the resulting face. */
  onRoll?: (value: DiceValue) => void;
  /** Face shown on first render (uncontrolled mode). @default 6 */
  defaultValue?: DiceValue;
  /** Cube edge length in pixels. @default 250 */
  size?: number;
  /** Background color of the faces (ignored if an image is provided). */
  faceBg?: string;
  /** Images of the faces, in order 1→6. An empty entry = default face. */
  faces?: string[];
  disabled?: boolean;
  /** Forces the resulting face on the next roll (cheating / tests). */
  cheatValue?: DiceValue; // Value provided by the parent to force the animation
  /** Anchor of the die, e.g. `"top-left"`. */
  placement?: DicePlacement;
  /** URL of a sound played during the roll. */
  sound?: string;
  /** Keys triggering the roll, in addition to `"click"`. @default ['click'] */
  triggers?: string[];
  className?: string;
  style?: CSSProperties;
  /**
   * Face displayed in controlled mode. Providing this prop switches the
   * component to controlled: it will no longer advance on its own.
   */
  value?: DiceValue;
  /** Called on every settle — used to sync `value`. */
  onValueChange?: (value: DiceValue) => void;
}

/* ================================================================
 * CSS — injected only once for the whole application.
 * Ideally, move it into a real .css file imported here.
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
/* No ".six" rule: the default ._3dbox transform IS face 6. */
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
  if (cssInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.setAttribute("type", "text/css");
  tag.textContent = DICE_CSS;
  document.head.appendChild(tag);
  cssInjected = true;
}

/* ================================================================
 * Static tables — at module level, references stable for life.
 * ================================================================ */

const VALUE_TO_CLASS: Record<DiceValue, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
};

const FACE_TRANSFORM: Record<DiceValue, (half: number) => CSSProperties> = {
  1: (half) => ({ transform: `rotateX(-90deg) translate3d(0, 0, ${half}px)` }),
  2: (half) => ({ transform: `translate3d(0, 0, ${half}px)` }),
  3: (half) => ({ transform: `rotateY(180deg) translate3d(0, 0, ${half}px)` }),
  4: (half) => ({
    left: "50%",
    marginLeft: `-${half}px`,
    transform: `rotateY(-90deg) translate3d(0, 0, ${half}px)`,
  }),
  5: (half) => ({
    left: "50%",
    marginLeft: `-${half}px`,
    transform: `rotateY(90deg) translate3d(0, 0, ${half}px)`,
  }),
  6: (half) => ({ transform: `rotateX(90deg) translate3d(0, 0, ${half}px)` }),
};

/** Cells lit up on the 5×5 grid, per face. */
const PIPS: Record<DiceValue, readonly number[]> = {
  1: [12],
  2: [11, 13],
  3: [6, 12, 18],
  4: [6, 8, 16, 18],
  5: [6, 8, 12, 16, 18],
  6: [6, 8, 11, 13, 16, 18],
};

const FACE_CLASSNAMES: readonly string[] = [
  "_3dface _3dface--one",
  "_3dface _3dface--two",
  "_3dface _3dface--three",
  "_3dface _3dface--four",
  "_3dface _3dface--five",
  "_3dface _3dface--six",
];

const GRID_CELLS: readonly number[] = Array.from({ length: 25 }, (_, i) => i);

/* ================================================================
 * Default face (the pips). Memoized.
 * ================================================================ */

interface DefaultFaceProps {
  faceNumber: DiceValue;
}

const DefaultFace = memo(function DefaultFace({
  faceNumber,
}: DefaultFaceProps) {
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
 * Main component
 * ================================================================ */
const Dice3D = forwardRef<Dice3DHandle, Dice3DProps>((props, ref) => {
  const {
    rollingTime = 1000,
    onRoll,
    onClick,
    defaultValue = 6,
    size = 250,
    faceBg,
    faces = [],
    disabled = false,
    cheatValue,
    placement,
    sound,
    triggers = ["click"],
    className,
    style,
    ...rest
  } = props;

  const [value, setValue] = useState<DiceValue>(defaultValue);
  const [rolling, setRolling] = useState(false);
  const isControlled = value !== undefined;
  const [internalValue /*setInternalValue*/] =
    useState<DiceValue>(defaultValue);
  const displayedValue: DiceValue =
    isControlled && value !== undefined ? value : internalValue;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onRollRef = useRef(onRoll);
  onRollRef.current = onRoll;

  const triggersRef = useRef(triggers);
  triggersRef.current = triggers;

  useEffect(() => {
    injectDiceCSS();
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  const animateCheat = useCallback(
    (forcedValue: DiceValue) => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);

      if (sound) {
        audioRef.current = new Audio(sound);
        void audioRef.current.play().catch(() => undefined);
      }

      setRolling(true);

      timeoutRef.current = setTimeout(() => {
        setRolling(false);
        setValue(forcedValue);

        if (onRollRef.current) {
          onRollRef.current(forcedValue);
        }

        audioRef.current?.pause();
        audioRef.current = null;
      }, rollingTime);
    },
    [rollingTime, sound],
  );

  // If cheatValue changes, the animation is triggered automatically
  useEffect(() => {
    if (cheatValue !== undefined && !rolling && !disabled) {
      animateCheat(cheatValue); //WARN: Hook error here
    }
  }, [cheatValue, rolling, disabled, animateCheat]);

  const rollDice = useCallback(
    (forcedValue?: DiceValue) => {
      if (forcedValue !== undefined) {
        animateCheat(forcedValue);
      } else {
        // Local random roll (fallback)
        const random = (Math.floor(Math.random() * 6) + 1) as DiceValue;
        animateCheat(random);
      }
    },
    [animateCheat],
  );

  useImperativeHandle(ref, () => ({ rollDice }), [rollDice]);

  /* --- Triggers: primitive key to avoid re-subscriptions --- */
  const triggersKey = Array.isArray(triggers) ? triggers.join("|") : "";

  const triggersList = useMemo<string[]>(
    () => (Array.isArray(triggers) ? triggers : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [triggersKey],
  );

  useEffect(() => {
    if (typeof window === "undefined" || triggersList.length === 0) {
      return undefined;
    }

    const handleKeyPress = (event: KeyboardEvent): void => {
      if (triggersList.includes(event.key)) rollDice();
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [triggersList, rollDice]);

  /* --- Faces: primitive key, immunizes against new
           array identities passed by the parent. --- */
  const facesKey = Array.isArray(faces) ? faces.join("|") : "";

  const facesList = useMemo<string[]>(
    () => (Array.isArray(faces) ? faces : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facesKey],
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

  /* --- Derived styles --- */
  const placementStyle = useMemo<CSSProperties>(() => {
    if (!placement) return {};

    const result: Record<string, string | number> = {};
    for (const token of placement.split("-")) {
      result[token] = token === "left" || token === "right" ? 0 : `-${size}px`;
    }
    return result as CSSProperties;
  }, [placement, size]);

  const buttonStyle = useMemo<CSSProperties>(
    () => ({
      ...placementStyle,
      ...style,
      width: `${size}px`,
      height: `${size}px`,
      filter: disabled ? "grayscale(100%)" : "unset",
    }),
    [placementStyle, style, size, disabled],
  );

  const isClickTrigger = triggersList.includes("click");

  const rootClassName = [
    "_space3d",
    VALUE_TO_CLASS[displayedValue] ?? VALUE_TO_CLASS[6],
    rolling ? "rolling" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

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
});

export { Dice3D, type Dice3DHandle };
