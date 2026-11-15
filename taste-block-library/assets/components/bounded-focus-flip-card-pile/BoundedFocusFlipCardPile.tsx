import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

type PileContextValue = {
  boundaryRef: React.RefObject<HTMLDivElement | null>;
  activeCardId: string | null;
  cardOrder: string[];
  raiseCard: (id: string) => void;
  reducedMotion: boolean;
  setActiveCardId: React.Dispatch<React.SetStateAction<string | null>>;
  registerClose: (id: string, handler: (immediate?: boolean) => void) => () => void;
  requestClose: (immediate?: boolean) => void;
};

const PileContext = createContext<PileContextValue | null>(null);
const FOCUS_EASE = [0.77, 0, 0.175, 1] as const;

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export type BoundedFocusFlipCardPileProps = {
  className?: string;
  children: ReactNode;
  reducedMotion?: boolean;
};

export function BoundedFocusFlipCardPile({
  className,
  children,
  reducedMotion = false,
}: BoundedFocusFlipCardPileProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const osReducedMotion = useReducedMotion();
  const shouldReduceMotion = reducedMotion || Boolean(osReducedMotion);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const raiseCard = useCallback((id: string) => {
    setCardOrder(order => [...order.filter(card => card !== id), id]);
  }, []);
  const closeHandlers = useRef(
    new Map<string, (immediate?: boolean) => void>(),
  );

  const registerClose = useCallback((
    id: string,
    handler: (immediate?: boolean) => void,
  ) => {
    closeHandlers.current.set(id, handler);
    return () => closeHandlers.current.delete(id);
  }, []);

  const requestClose = useCallback((immediate = false) => {
    if (activeCardId) closeHandlers.current.get(activeCardId)?.(immediate);
  }, [activeCardId]);

  useEffect(() => {
    if (!activeCardId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCardId, requestClose]);

  const value = useMemo(
    () => ({
      boundaryRef,
      activeCardId,
      cardOrder,
      raiseCard,
      reducedMotion: shouldReduceMotion,
      setActiveCardId,
      registerClose,
      requestClose,
    }),
    [activeCardId, cardOrder, raiseCard, registerClose, requestClose, shouldReduceMotion],
  );

  return (
    <PileContext.Provider value={value}>
      <div
        ref={boundaryRef}
        className={classes("bounded-focus-card-pile", className)}
      >
        <AnimatePresence>
          {activeCardId ? (
            <motion.button
              key="focus-backdrop"
              type="button"
              className="bounded-focus-card-backdrop"
              aria-label="关闭卡片详情"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => requestClose(false)}
            />
          ) : null}
        </AnimatePresence>
        {children}
      </div>
    </PileContext.Provider>
  );
}

export type BoundedFocusFlipCardProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  backContent?: ReactNode;
  focusLabel?: string;
};

function useFinePointer() {
  const [isFinePointer, setIsFinePointer] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isFinePointer;
}

export function BoundedFocusFlipCard({
  className,
  style,
  children,
  backContent,
  focusLabel = "打开卡片详情",
}: BoundedFocusFlipCardProps) {
  const context = useContext(PileContext);
  const cardId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragControls = useDragControls();
  const isFinePointer = useFinePointer();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [focusScale, setFocusScale] = useState(1.04);
  const isDragging = useRef(false);
  const isClosing = useRef(false);
  const pointerStart = useRef<{ id: number; x: number; y: number; moved: boolean; target: EventTarget } | null>(null);
  const validTap = useRef(false);
  const returnPosition = useRef({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });
  const smoothMouseY = useSpring(mouseY, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });
  const rotateX = useTransform(smoothMouseY, [-300, 300], [25, -25]);
  const rotateY = useTransform(smoothMouseX, [-300, 300], [-25, 25]);
  const isFocused = context?.activeCardId === cardId;
  const isObscured = Boolean(context?.activeCardId && !isFocused);
  const shouldReduceMotion = Boolean(context?.reducedMotion);

  const resetTilt = useCallback(() => {
    mouseX.jump(0);
    mouseY.jump(0);
    smoothMouseX.jump(0);
    smoothMouseY.jump(0);
  }, [mouseX, mouseY, smoothMouseX, smoothMouseY]);

  const clearTilt = useCallback(() => {
    mouseX.jump(0);
    mouseY.jump(0);
    smoothMouseX.jump(0);
    smoothMouseY.jump(0);
  }, [mouseX, mouseY, smoothMouseX, smoothMouseY]);

  const finishInterruptedDrag = useCallback(() => {
    validTap.current = false;
    pointerStart.current = null;
    isDragging.current = false;
    pointerStart.current = null;
    dragControls.stop();
    resetTilt();
  }, [dragControls, resetTilt]);

  useEffect(() => {
    const onWindowExit = (event: MouseEvent) => {
      if (!event.relatedTarget) finishInterruptedDrag();
    };
    const onVisibilityChange = () => {
      if (document.hidden) finishInterruptedDrag();
    };
    window.addEventListener("blur", finishInterruptedDrag);
    document.addEventListener("mouseout", onWindowExit);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", finishInterruptedDrag);
      document.removeEventListener("mouseout", onWindowExit);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [finishInterruptedDrag]);

  const closeDetails = useCallback((immediate = false) => {
    if (!context || !isFocused || isClosing.current) return;
    isClosing.current = true;
    setIsFlipped(false);
    setFocusScale(1.04);
    setIsReturning(true);
    context.setActiveCardId((current) =>
      current === cardId ? null : current,
    );
    x.stop();
    y.stop();
    const duration = shouldReduceMotion || immediate ? 0 : 0.3;
    Promise.all([
      animate(x, returnPosition.current.x, {
        type: "tween",
        duration,
        ease: FOCUS_EASE,
      }),
      animate(y, returnPosition.current.y, {
        type: "tween",
        duration,
        ease: FOCUS_EASE,
      }),
    ]).then(() => {
      setIsReturning(false);
      isClosing.current = false;
      requestAnimationFrame(() => openButtonRef.current?.focus({ preventScroll: true }));
    });
  }, [cardId, context, isFocused, shouldReduceMotion, x, y]);

  useEffect(() => {
    if (!context) return;
    return context.registerClose(cardId, closeDetails);
  }, [cardId, closeDetails, context]);

  useEffect(() => {
    if (!isFocused) return;
    requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;
    const boundary = context?.boundaryRef.current;
    if (!boundary) return;
    const recenter = () => {
      const card = cardRef.current;
      if (!card) return;
      x.stop();
      y.stop();
      const previousTransform = card.style.transform;
      card.style.transform = "none";
      const baseRect = card.getBoundingClientRect();
      card.style.transform = previousTransform;
      const boundaryRect = boundary.getBoundingClientRect();
      const targetWidth = Math.min(
        352,
        boundaryRect.width - 64,
        (boundaryRect.height - 64) / 1.18,
      );
      setFocusScale(Math.max(1.04, targetWidth / card.offsetWidth));
      const duration = shouldReduceMotion ? 0 : 0.2;
      animate(
        x,
        boundaryRect.left + boundaryRect.width / 2 -
          (baseRect.left + baseRect.width / 2),
        { type: "tween", duration, ease: FOCUS_EASE },
      );
      animate(
        y,
        boundaryRect.top + boundaryRect.height / 2 -
          (baseRect.top + baseRect.height / 2),
        { type: "tween", duration, ease: FOCUS_EASE },
      );
    };
    window.addEventListener("resize", recenter);
    return () => window.removeEventListener("resize", recenter);
  }, [context, isFocused, shouldReduceMotion, x, y]);

  const openDetails = useCallback((immediate = false) => {
    if (
      !context ||
      !backContent ||
      context.activeCardId || isReturning || isClosing.current
    ) {
      return;
    }
    const card = cardRef.current;
    const boundary = context.boundaryRef.current;
    if (!card || !boundary) return;
    x.stop();
    y.stop();
    clearTilt();
    const previousTransform = card.style.transform;
    card.style.transform = "none";
    const baseRect = card.getBoundingClientRect();
    card.style.transform = previousTransform;
    returnPosition.current = { x: x.get(), y: y.get() };
    const boundaryRect = boundary.getBoundingClientRect();
    const targetWidth = Math.min(
      352,
      boundaryRect.width - 64,
      (boundaryRect.height - 64) / 1.18,
    );
    setFocusScale(Math.max(1.04, targetWidth / card.offsetWidth));
    context.raiseCard(cardId);
    context.setActiveCardId(cardId);
    setIsFlipped(true);
    const duration = shouldReduceMotion || immediate ? 0 : 0.3;
    animate(
      x,
      boundaryRect.left + boundaryRect.width / 2 -
        (baseRect.left + baseRect.width / 2),
      { type: "tween", duration, ease: FOCUS_EASE },
    );
    animate(
      y,
      boundaryRect.top + boundaryRect.height / 2 -
        (baseRect.top + baseRect.height / 2),
      { type: "tween", duration, ease: FOCUS_EASE },
    );
  }, [backContent, cardId, clearTilt, context, isReturning, shouldReduceMotion, x, y]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) start.moved = true;
    if (isFinePointer && event.pointerType === "mouse" && !isFocused && !isReturning && !isDragging.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - (rect.left + rect.width / 2));
      mouseY.set(event.clientY - (rect.top + rect.height / 2));
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={classes("bounded-focus-card", className)}
      style={{ ...style, x, y, opacity: 1, zIndex: isFocused || isReturning ? 50 : (context?.cardOrder.indexOf(cardId) ?? -1) + 1 }}
      data-focused={isFocused}
      data-obscured={isObscured}
      data-flipped={isFlipped}
      data-returning={isReturning}
      data-reduced-motion={shouldReduceMotion}
      aria-hidden={isObscured}
      drag={!isFocused && !isReturning}
      dragConstraints={context?.boundaryRef}
      onMeasureDragConstraints={() => {
        const card = cardRef.current;
        const boundary = context?.boundaryRef.current;
        if (!card || !boundary) return { left: 0, right: 0, top: 0, bottom: 0 };
        // Measure the CSS resting position, independent of cached viewport projection.
        const transform = card.style.transform;
        card.style.transform = "none";
        const rect = card.getBoundingClientRect();
        card.style.transform = transform;
        const bounds = boundary.getBoundingClientRect();
        return { left: bounds.left - rect.left, right: bounds.right - rect.right,
          top: bounds.top - rect.top, bottom: bounds.bottom - rect.bottom };
      }}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={!shouldReduceMotion}
      dragTransition={{
        power: 0.1,
        timeConstant: 240,
        bounceStiffness: 200,
        bounceDamping: 24,
      }}
      whileHover={
        isFinePointer && !isFocused && !isReturning
          ? { scale: 1.02 }
          : undefined
      }
      whileDrag={{ cursor: "grabbing" }}
      onDragStart={() => {
        context?.raiseCard(cardId);
        isDragging.current = true;
        validTap.current = false;
        if (pointerStart.current) pointerStart.current.moved = true;
        resetTilt();
      }}
      onDragEnd={() => {
        isDragging.current = false;
        resetTilt();
      }}
      onPointerDown={(event) => {
        validTap.current = false;
        if (event.button !== 0 || !event.isPrimary || isReturning) return;
        pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, target: event.target };
        if (!isFocused && !isObscured) dragControls.start(event, { distanceThreshold: 6 });
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => {
        const start = pointerStart.current;
        validTap.current = Boolean(start && start.id === event.pointerId && !start.moved &&
          Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6);
      }}
      onClickCapture={(event) => {
        // Change faces only after the browser has resolved the click target.
        if (event.detail === 0) return;
        const start = pointerStart.current;
        const tap = validTap.current;
        validTap.current = false;
        pointerStart.current = null;
        const target = event.target instanceof Element ? event.target : null;
        const action = target?.closest("a, button");
        if (!tap || isReturning || (action && start?.target instanceof Element && start.target.closest("a, button") !== action)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (isFocused && action) return;
        event.preventDefault();
        event.stopPropagation();
        if (isFocused) closeDetails(false); else openDetails(false);
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
        finishInterruptedDrag();
      }}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
    >
      <motion.div
        className="bounded-focus-card-tilt"
        style={{
          rotateX: !isFinePointer || isFocused || isReturning || shouldReduceMotion ? 0 : rotateX,
          rotateY: !isFinePointer || isFocused || isReturning || shouldReduceMotion ? 0 : rotateY,
        }}
      >
      <motion.div
        className="bounded-focus-card-flipper"
        initial={false}
        animate={{
          transform:
            isFlipped && !shouldReduceMotion
              ? `rotateY(180deg) scale(${focusScale})`
              : "rotateY(0deg) scale(1)",
        }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.3,
          ease: FOCUS_EASE,
        }}
      >
        <div className="bounded-focus-card-face bounded-focus-card-front">
          {children}
          <button
            ref={openButtonRef}
            type="button"
            className="bounded-focus-card-open"
            aria-label={focusLabel}
            aria-hidden={isFocused || isReturning}
            disabled={isFocused || isReturning}
            onClick={(event) => {
              if (event.detail === 0) openDetails(true);
            }}
          />
        </div>
        {backContent ? (
          <div
            className="bounded-focus-card-face bounded-focus-card-back"
            aria-hidden={!isFocused}
          >
            <div
              className="bounded-focus-card-back-content"
              style={{
                width: `${focusScale * 100}%`,
                height: `${focusScale * 100}%`,
                transform: `scale(${1 / focusScale})`,
              }}
            >
              <div className="bounded-focus-card-back-scroll">
                {backContent}
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
      </motion.div>
      {isFocused ? (
        <button
          ref={closeButtonRef}
          type="button"
          className="bounded-focus-card-close"
          aria-label="关闭卡片详情"
          style={{
            top: `calc(${(1 - focusScale) * 50}% - 0.35rem)`,
            right: `calc(${(1 - focusScale) * 50}% - 0.35rem)`,
          }}
          onClick={(event) => closeDetails(event.detail === 0)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      ) : null}
    </motion.div>
  );
}
