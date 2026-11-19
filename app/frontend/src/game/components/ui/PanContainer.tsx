import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActionIcon, Box, Group } from "@mantine/core";
import { IconZoomIn, IconZoomOut, IconZoomReset } from "@tabler/icons-react";

type PanContainerProps = {
  children: ReactNode;
  maxPan?: number;
  minScale?: number;
  maxScale?: number;
  zoomStep?: number;
};

export function PanContainer({
  children,
  maxPan = 400,
  minScale = 1,
  maxScale = 3,
  zoomStep = 1.25,
}: PanContainerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startOffsetRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  const pinchDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);

  const clamp = useCallback(
    (value: number) => Math.max(-maxPan, Math.min(maxPan, value)),
    [maxPan],
  );

  const applyPan = useCallback(
    (dx: number, dy: number) => {
      setOffset({
        x: clamp(startOffsetRef.current.x + dx),
        y: clamp(startOffsetRef.current.y + dy),
      });
    },
    [clamp],
  );

  const applyScale = useCallback(
    (next: number) => setScale(Math.max(minScale, Math.min(maxScale, next))),
    [minScale, maxScale],
  );

  /* ----------------------- zoom controls -------------------------- */
  const zoomIn = useCallback(
    () => applyScale(scale * zoomStep),
    [applyScale, scale, zoomStep],
  );
  const zoomOut = useCallback(
    () => applyScale(scale / zoomStep),
    [applyScale, scale, zoomStep],
  );
  const zoomReset = useCallback(() => {
    applyScale(1);
    setOffset({ x: 0, y: 0 });
  }, [applyScale]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      draggingRef.current = true;
      setDragging(true);
      pointerRef.current = { x: event.clientX, y: event.clientY };
      startOffsetRef.current = offset;
    },
    [offset],
  );

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      applyPan(
        event.clientX - pointerRef.current.x,
        event.clientY - pointerRef.current.y,
      );
    };
    const onMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [applyPan]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? zoomStep : 1 / zoomStep;
      applyScale(scale * factor);
    };
    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel);
  }, [applyScale, scale, zoomStep]);

  /* ------------------------- touch handling ------------------------ */
  const onTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      pinchDistRef.current = Math.hypot(
        a.clientX - b.clientX,
        a.clientY - b.clientY,
      );
      pinchStartScaleRef.current = scale;
      draggingRef.current = false;
      setDragging(false);
      return;
    }
    const touch = event.touches[0];
    if (!touch) return;
    draggingRef.current = true;
    setDragging(true);
    pointerRef.current = { x: touch.clientX, y: touch.clientY };
    startOffsetRef.current = offset;
  };

  useEffect(() => {
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const [a, b] = [event.touches[0], event.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinchDistRef.current > 0) {
          applyScale(
            pinchStartScaleRef.current * (dist / pinchDistRef.current),
          );
        }
        return;
      }
      if (!draggingRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      event.preventDefault(); // stops the page from scrolling/zooming
      applyPan(
        touch.clientX - pointerRef.current.x,
        touch.clientY - pointerRef.current.y,
      );
    };
    const onTouchEnd = () => {
      draggingRef.current = false;
      setDragging(false);
      pinchDistRef.current = 0;
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyPan, applyScale]);

  return (
    <Box
      ref={hostRef}
      w="100%"
      h="100%"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <Box
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.15s ease-out",
        }}
      >
        {children}
      </Box>

      <Group
        gap="xs"
        wrap="nowrap"
        style={{
          position: "absolute",
          bottom: 4,
          left: 0,
          right: 0,
          margin: "0 auto",
          width: "fit-content",
          zIndex: 20,
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <ActionIcon
          variant="default"
          size="lg"
          radius="md"
          onClick={zoomOut}
          aria-label="Zoom out"
          disabled={scale <= minScale}
        >
          <IconZoomOut size={20} />
        </ActionIcon>
        <ActionIcon
          variant="default"
          size="lg"
          radius="md"
          onClick={zoomReset}
          aria-label="Reset zoom"
          disabled={scale === 1 && offset.x === 0 && offset.y === 0}
        >
          <IconZoomReset size={20} />
        </ActionIcon>
        <ActionIcon
          variant="default"
          size="lg"
          radius="md"
          onClick={zoomIn}
          aria-label="Zoom in"
          disabled={scale >= maxScale}
        >
          <IconZoomIn size={20} />
        </ActionIcon>
      </Group>
    </Box>
  );
}

export default PanContainer;
