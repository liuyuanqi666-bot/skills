import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function scrollEase(progress: number) {
  if (progress <= 0 || progress >= 1) return progress;

  let lower = 0;
  let upper = 1;
  let curvePosition = progress;
  for (let index = 0; index < 12; index += 1) {
    const inverse = 1 - curvePosition;
    const curveTime =
      3 * inverse * inverse * curvePosition * 0.77 +
      3 * inverse * curvePosition * curvePosition * 0.175 +
      curvePosition * curvePosition * curvePosition;
    if (curveTime < progress) lower = curvePosition;
    else upper = curvePosition;
    curvePosition = (lower + upper) / 2;
  }

  const inverse = 1 - curvePosition;
  return 3 * inverse * curvePosition * curvePosition + curvePosition * curvePosition * curvePosition;
}

export interface WebGLHeroProps {
  imageSrc: string;
  zoom?: number;
  displacement?: number;
  chromaticShift?: number;
  tilt?: number;
}

const directoryItems = [
  "产品概览", "行程亮点", "线路地图", "每日行程",
  "酒店餐饮", "服务说明", "出行须知", "资料下载",
];

export const WebGLChromaticHero: React.FC<WebGLHeroProps> = ({
  imageSrc,
  zoom = 0.1,
  displacement = 0.03,
  chromaticShift = 0.012,
  tilt = 0.12,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef(0);
  const [isWebglReady, setIsWebglReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  useLayoutEffect(() => {
    const syncSubtitleWidth = () => {
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      if (!title || !subtitle) return;
      subtitle.style.maxWidth = window.innerWidth >= 768 ? `${title.offsetWidth}px` : "";
    };
    syncSubtitleWidth();
    window.addEventListener("resize", syncSubtitleWidth);
    return () => window.removeEventListener("resize", syncSubtitleWidth);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const cancelScrollAnimation = () => {
      if (!scrollAnimationRef.current) return;
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = 0;
    };

    window.addEventListener("wheel", cancelScrollAnimation, { passive: true });
    window.addEventListener("touchstart", cancelScrollAnimation, { passive: true });
    window.addEventListener("pointerdown", cancelScrollAnimation, { passive: true });
    window.addEventListener("keydown", cancelScrollAnimation);
    return () => {
      cancelScrollAnimation();
      window.removeEventListener("wheel", cancelScrollAnimation);
      window.removeEventListener("touchstart", cancelScrollAnimation);
      window.removeEventListener("pointerdown", cancelScrollAnimation);
      window.removeEventListener("keydown", cancelScrollAnimation);
    };
  }, []);

  const handleScrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const startY = window.scrollY;
    if (startY <= 0) return;

    cancelAnimationFrame(scrollAnimationRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }

    const startTime = performance.now();
    const duration = 280;
    const move = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      window.scrollTo(0, Math.round(startY * (1 - scrollEase(progress))));
      if (progress < 1) scrollAnimationRef.current = requestAnimationFrame(move);
      else scrollAnimationRef.current = 0;
    };
    scrollAnimationRef.current = requestAnimationFrame(move);
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let currentProgress = 0;
    let targetProgress = 0;
    let animationFrameId = 0;
    let isAnimating = false;

    const applyVisuals = (progress: number) => {
      header.style.backgroundColor = `rgba(8, 29, 59, ${(progress * 0.94).toFixed(3)})`;
      header.style.borderBottomColor = `rgba(255, 255, 255, ${(progress * 0.16).toFixed(3)})`;
      if (progress > 0.005) {
        const blur = (progress * 16).toFixed(1);
        header.style.backdropFilter = `blur(${blur}px)`;
        header.style.setProperty("-webkit-backdrop-filter", `blur(${blur}px)`);
        header.style.boxShadow = `0 4px 25px rgba(0, 0, 0, ${(progress * 0.36).toFixed(3)})`;
      } else {
        header.style.backdropFilter = "none";
        header.style.setProperty("-webkit-backdrop-filter", "none");
        header.style.boxShadow = "none";
      }
    };

    const animate = () => {
      currentProgress += (targetProgress - currentProgress) * 0.13;
      if (Math.abs(currentProgress - targetProgress) < 0.0005) {
        currentProgress = targetProgress;
        applyVisuals(currentProgress);
        isAnimating = false;
        return;
      }
      applyVisuals(currentProgress);
      animationFrameId = requestAnimationFrame(animate);
    };

    const updateTarget = () => {
      const linear = Math.min(1, Math.max(0, window.scrollY / 440));
      targetProgress = linear * linear * linear * (linear * (linear * 6 - 15) + 10);
      if (!isAnimating) {
        isAnimating = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    updateTarget();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", updateTarget);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vertexSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;
      uniform sampler2D uImage;
      uniform vec2 uPointer;
      uniform float uImageAspect;
      uniform float uCanvasAspect;
      uniform vec2 uFocus;
      uniform float uProgress;
      uniform float uZoom;
      uniform float uWarp;
      uniform float uChromatic;
      varying vec2 vUv;

      vec2 cover(vec2 uv) {
        if (uImageAspect > uCanvasAspect) {
          uv.x = (uv.x - 0.5) * uCanvasAspect / uImageAspect + uFocus.x;
        } else {
          uv.y = (uv.y - 0.5) * uImageAspect / uCanvasAspect + uFocus.y;
        }
        return uv;
      }

      void main() {
        float strength = uProgress;
        vec2 movement = (uPointer - vec2(0.5)) * vec2(uCanvasAspect, 1.0);
        vec2 direction = movement / max(length(movement), 0.2);
        vec2 baseUv = mix(vUv, vec2(0.5), uZoom * uProgress * 0.28);
        float band = sin(vUv.y * 24.0 + uPointer.x * 5.0);
        float fineBand = sin(vUv.y * 71.0 - uPointer.y * 4.0);
        baseUv.x += (band * 0.72 + fineBand * 0.28) * uWarp * strength * 0.16;
        baseUv.y += direction.y * uWarp * strength * 0.12;
        baseUv = cover(baseUv);
        vec2 split = direction * uChromatic * strength;
        split.x += band * uChromatic * strength * 0.35;
        float red = texture2D(uImage, clamp(baseUv + split, 0.0, 1.0)).r;
        float green = texture2D(uImage, clamp(baseUv, 0.0, 1.0)).g;
        float blue = texture2D(uImage, clamp(baseUv - split, 0.0, 1.0)).b;
        gl_FragColor = vec4(red, green, blue, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      image: gl.getUniformLocation(program, "uImage"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      imageAspect: gl.getUniformLocation(program, "uImageAspect"),
      canvasAspect: gl.getUniformLocation(program, "uCanvasAspect"),
      focus: gl.getUniformLocation(program, "uFocus"),
      progress: gl.getUniformLocation(program, "uProgress"),
      zoom: gl.getUniformLocation(program, "uZoom"),
      warp: gl.getUniformLocation(program, "uWarp"),
      chromatic: gl.getUniformLocation(program, "uChromatic"),
    };
    gl.uniform1i(uniforms.image, 0);
    gl.uniform1f(uniforms.zoom, zoom);
    gl.uniform1f(uniforms.warp, displacement);
    gl.uniform1f(uniforms.chromatic, chromaticShift);
    gl.uniform2f(uniforms.focus, 0.465, 0.5);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.clearColor(0.031, 0.114, 0.231, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    const pointer = { x: 0.5, y: 0.5 };
    const pointerTarget = { x: 0.5, y: 0.5 };
    let progress = 0;
    let progressTarget = 0;
    let isRendering = false;
    let previousTime = performance.now();
    let animationFrameId = 0;
    let imageReady = false;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const renderWidth = Math.round(width * pixelRatio);
      const renderHeight = Math.round(height * pixelRatio);
      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        gl.viewport(0, 0, renderWidth, renderHeight);
      }
      gl.uniform1f(uniforms.canvasAspect, width / height);
    };

    const lerp = (current: number, target: number, speed: number, delta: number) =>
      current + (target - current) * (1 - Math.exp(-speed * delta));

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      progress = lerp(progress, progressTarget, 10, delta);
      pointer.x = lerp(pointer.x, pointerTarget.x, 30, delta);
      pointer.y = lerp(pointer.y, pointerTarget.y, 30, delta);
      gl.uniform1f(uniforms.progress, progress);
      gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (imageReady) gl.drawArrays(gl.TRIANGLES, 0, 3);
      const rotateX = (0.5 - pointer.y) * tilt * 18;
      const rotateY = (pointer.x - 0.5) * tilt * 18;
      canvas.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.025)`;

      const isSettled =
        Math.abs(progress - progressTarget) < 0.001 &&
        Math.abs(pointer.x - pointerTarget.x) < 0.001 &&
        Math.abs(pointer.y - pointerTarget.y) < 0.001;
      if (isSettled) isRendering = false;
      else animationFrameId = requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (isRendering) return;
      isRendering = true;
      previousTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = container.getBoundingClientRect();
      pointerTarget.x = (event.clientX - rect.left) / rect.width;
      pointerTarget.y = 1 - (event.clientY - rect.top) / rect.height;
      progressTarget = 1;
      requestRender();
    };
    const handlePointerLeave = () => {
      pointerTarget.x = 0.5;
      pointerTarget.y = 0.5;
      progressTarget = 0;
      requestRender();
    };
    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    let disposed = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (disposed) return;
      const textureSource = document.createElement("canvas");
      const sourceAspect = image.naturalWidth / image.naturalHeight;
      textureSource.width = Math.max(image.naturalWidth, 1440);
      textureSource.height = Math.round(textureSource.width / sourceAspect);
      const textureContext = textureSource.getContext("2d");
      if (!textureContext) return;
      textureContext.imageSmoothingEnabled = true;
      textureContext.imageSmoothingQuality = "high";
      textureContext.drawImage(image, 0, 0, textureSource.width, textureSource.height);

      while (gl.getError() !== gl.NO_ERROR) {
        // Clear initialization errors before validating the texture upload itself.
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSource);
      const uploadError = gl.getError();
      canvas.dataset.textureUploadError = String(uploadError);
      canvas.dataset.textureSourceSize = `${textureSource.width}x${textureSource.height}`;
      if (uploadError !== gl.NO_ERROR) return;
      gl.uniform1f(uniforms.imageAspect, image.naturalWidth / image.naturalHeight);
      imageReady = true;
      resize();
      requestRender();
      setIsWebglReady(true);
    };
    image.onerror = () => setIsWebglReady(false);
    image.src = imageSrc;

    const resizeObserver = new ResizeObserver(() => {
      resize();
      requestRender();
    });
    resizeObserver.observe(container);
    resize();

    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [imageSrc, zoom, displacement, chromaticShift, tilt]);

  return (
    <div id="page-top" className="relative min-h-[100svh] bg-[#081d3b] text-white">
      <header
        ref={headerRef}
        className="glass-nav pointer-events-none fixed inset-x-0 top-0 z-50 flex w-full items-center justify-between gap-3 border-b border-transparent px-4 py-3 sm:px-8 sm:py-4 lg:px-12"
        style={{ backgroundColor: "rgba(8, 29, 59, 0)", borderBottomColor: "rgba(255, 255, 255, 0)", backdropFilter: "none", WebkitBackdropFilter: "none", boxShadow: "none" }}
      >
        <a href="#page-top" onClick={handleScrollToTop} className="group pointer-events-auto flex min-w-0 items-center gap-2 select-none">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          <span className="brand-hover-label truncate text-xs font-medium whitespace-nowrap text-white/95 transition-colors duration-200 sm:text-sm sm:tracking-wider">
            <span className="sm:hidden">旅行模板 · 内容待补充</span>
            <span className="hidden sm:inline">旅行产品模板 · 目的地与行程待补充</span>
          </span>
        </a>

        <div className="pointer-events-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {["行程亮点", "线路概览", "出行须知"].map((item) => (
            <button key={item} type="button" className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white md:inline-flex">
              {item}
            </button>
          ))}
          <div ref={menuRef} className="relative shrink-0 text-left">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="glass-capsule group flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg transition-[transform,background-color,border-color] duration-200 active:scale-95 sm:gap-2 sm:px-3.5"
            >
              <span className="flex w-3.5 shrink-0 flex-col justify-center gap-[3px]">
                <span className="menu-line-shift h-[1.5px] w-full rounded-full bg-white transition-transform duration-200" />
                <span className="menu-line-grow h-[1.5px] w-2.5 rounded-full bg-emerald-300 transition-[width] duration-200" />
                <span className="menu-line-shift h-[1.5px] w-full rounded-full bg-white transition-transform duration-200" />
              </span>
              <span className="tracking-wide">目录导览</span>
              <svg className={cn("size-3.5 shrink-0 text-white/70 transition-transform duration-200", isMenuOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="glass-menu absolute top-full right-0 z-50 mt-2 w-48 rounded-2xl p-2 text-white sm:w-52">
                <div className="mb-1 flex items-center justify-between border-b border-white/10 px-2.5 py-1.5">
                  <span className="text-xs font-semibold tracking-wider text-white/90">✦ 目录导览</span>
                  <span className="font-mono text-[10px] text-white/50">8 个章节</span>
                </div>
                <nav className="flex flex-col gap-0.5">
                  {directoryItems.map((item, index) => (
                    <button key={item} type="button" onClick={() => setIsMenuOpen(false)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/15">
                      <span className="w-5 shrink-0 font-mono text-xs font-semibold text-emerald-400">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-xs font-medium whitespace-nowrap text-white/95">{item}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      <section ref={containerRef} className="relative isolate h-[100svh] min-h-[500px] w-full overflow-hidden bg-[#081d3b]">
        <img
          src={imageSrc}
          alt="旅行主题星空占位背景"
          style={{ objectPosition: "46.5% 50%" }}
          className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 select-none", isWebglReady ? "opacity-0" : "opacity-100")}
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn("pointer-events-none absolute -inset-[2.5%] size-[105%] transform-gpu transition-opacity duration-300 will-change-transform", isWebglReady ? "opacity-100" : "opacity-0")}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,29,59,0.45)_0%,rgba(0,0,0,0)_25%,rgba(0,0,0,0.25)_60%,rgba(8,29,59,0.95)_100%)]" />

        <div className="hero-content-padding pointer-events-none absolute inset-0 z-10 flex flex-col justify-end">
          <div className="flex w-full flex-col items-start">
            <div className="pointer-events-auto flex max-w-fit flex-col items-start gap-4 select-text">
              <div className="inline-flex max-w-fit flex-col items-start gap-2">
                <p className="flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide whitespace-nowrap text-emerald-300">
                  ✦ 目的地体验 · 行程亮点 · 特色活动
                </p>
                <h1 ref={titleRef} className="hero-main-title font-medium tracking-tight whitespace-nowrap text-white drop-shadow-lg">
                  探索目的地，<br />开启全新旅程
                </h1>
                <p ref={subtitleRef} className="hero-subtitle max-w-[28rem] font-light text-white/90 drop-shadow">
                  在这里填写线路天数、核心体验与目的地亮点，具体行程信息待补充。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button type="button" onClick={() => setToast("行程详情内容待接入")} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold whitespace-nowrap text-neutral-950 ring-1 ring-white transition-transform hover:scale-105 active:scale-95">
                  <span>查看行程详情</span><span className="font-mono text-neutral-500">→</span>
                </button>
                <button type="button" onClick={() => setToast("行程资料待补充")} className="glass-capsule flex cursor-pointer items-center gap-2 rounded-full px-5 py-3 text-xs font-medium whitespace-nowrap text-white transition-transform active:scale-95">
                  <svg className="size-4 shrink-0 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707L19 9.414V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>下载行程资料</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => document.getElementById("preview-continuation")?.scrollIntoView({ behavior: "smooth" })} className="desktop-scroll-hint group pointer-events-auto absolute bottom-5 left-1/2 z-20 -translate-x-1/2 cursor-pointer flex-col items-center gap-1.5 text-white/70 transition-colors hover:text-white lg:bottom-6">
          <span className="font-mono text-[11px] tracking-widest whitespace-nowrap text-white/60 transition-colors group-hover:text-emerald-300">向下滑动浏览更多内容</span>
          <svg className="scroll-arrow size-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      <div aria-live="polite" className={cn("glass-menu pointer-events-none fixed right-6 bottom-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium text-white transition-[transform,opacity] duration-300", toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0")}>
        <span className="font-bold text-emerald-400">✓</span><span>{toast || "操作成功"}</span>
      </div>
    </div>
  );
};

