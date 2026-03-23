"use client";

import { useEffect, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

type BeneficiaryPoint = {
  id: string;
  ward: string;
  sector: string;
  impactArea: string;
  coordinates: [number, number];
  impactScore: number;
};

type Props = {
  wardImpactData: Record<string, number>;
  beneficiaryPoints: BeneficiaryPoint[];
  showBeneficiaryDots: boolean;
};

type GeoFeature = Feature<Geometry, GeoJsonProperties> & { name?: string };
type GeoJsonData = FeatureCollection<Geometry, GeoJsonProperties>;

type HoverInfo = {
  x: number;
  y: number;
  object: GeoFeature | BeneficiaryPoint;
};

const INITIAL_VIEW_STATE = {
  latitude: -0.0917,
  longitude: 34.768,
  zoom: 10.2,
  pitch: 0,
  bearing: 0,
};

const LOW_THRESHOLD = 40;
const MID_THRESHOLD = 70;

function normalizeName(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\bward\b/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFeatureName(feature: GeoFeature) {
  const props = feature?.properties || {};
  const getString = (value: unknown) => (typeof value === "string" ? value : "");
  return (
    feature?.name ||
    getString(props.name) ||
    getString(props.NAME) ||
    getString(props.ward) ||
    getString(props.WARD) ||
    getString(props.subcounty) ||
    getString(props.sub_county) ||
    "Unknown"
  );
}

export default function KisumuImpactMap({
  wardImpactData,
  beneficiaryPoints,
  showBeneficiaryDots,
}: Props) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [geojson, setGeojson] = useState<GeoJsonData | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [webglSupported] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    const gl = canvas.getContext("webgl");
    return Boolean(gl2 || gl);
  });

  const normalizedWardImpactData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(wardImpactData).map(([key, value]) => [normalizeName(key), value])
    );
  }, [wardImpactData]);

  useEffect(() => {
    const updateThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    updateThemeState();
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadGeojson() {
      const response = await fetch("/data/kisumu.geojson");
      if (!response.ok) return;
      const data = (await response.json()) as GeoJsonData;
      if (mounted) setGeojson(data);
    }
    loadGeojson();
    return () => {
      mounted = false;
    };
  }, []);

  const layers = useMemo(() => {
    if (!geojson) return [];

    const getInterpolatedHeatColor = (value: number | undefined): [number, number, number, number] => {
      if (value == null) return [110, 120, 140, 85];
      const clamped = Math.max(0, Math.min(100, value));
      if (clamped < LOW_THRESHOLD) return [56, 132, 255, 220];
      if (clamped < MID_THRESHOLD) return [255, 193, 92, 190];
      return [255, 86, 124, 200];
    };

    const wardLayer = new GeoJsonLayer({
      id: "kisumu-ward-heat",
      data: geojson,
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getFillColor: (feature: GeoFeature) => {
        const wardValue = normalizedWardImpactData[normalizeName(getFeatureName(feature))];
        return getInterpolatedHeatColor(wardValue);
      },
      getLineColor: [250, 250, 255, 120],
      updateTriggers: {
        getFillColor: [normalizedWardImpactData],
      },
      onHover: (info: { x: number; y: number; object?: GeoFeature }) =>
        setHoverInfo(info?.object ? { x: info.x, y: info.y, object: info.object } : null),
    });

    const pointsLayer = new ScatterplotLayer({
      id: "kisumu-beneficiary-points",
      data: showBeneficiaryDots ? beneficiaryPoints : [],
      pickable: true,
      radiusUnits: "pixels",
      radiusMinPixels: 4,
      radiusMaxPixels: 10,
      getPosition: (d: BeneficiaryPoint) => d.coordinates,
      getRadius: (d: BeneficiaryPoint) => (d.impactScore >= 80 ? 6 : d.impactScore >= 60 ? 5 : 4),
      getFillColor: (d: BeneficiaryPoint) =>
        d.impactScore >= 80 ? [255, 86, 124, 210] : d.impactScore >= 60 ? [255, 193, 92, 205] : [89, 161, 255, 195],
      getLineColor: [250, 250, 255, 255],
      lineWidthMinPixels: 1,
      stroked: true,
      onHover: (info: { x: number; y: number; object?: BeneficiaryPoint }) => {
        if (info?.object) {
          setHoverInfo({ x: info.x, y: info.y, object: info.object });
        }
      },
    });

    return [wardLayer, pointsLayer];
  }, [beneficiaryPoints, geojson, normalizedWardImpactData, showBeneficiaryDots]);

  if (webglSupported === false) {
    return (
      <div className="rounded-xl border border-dashed border-primary/25 bg-background/70 p-4 text-sm text-muted-foreground">
        Map rendering is unavailable on this browser/device (WebGL not supported). Data tracking is
        still active in the ward breakdown cards below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!mapboxToken ? (
        <div className="rounded-lg border border-dashed border-primary/25 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
          Missing `NEXT_PUBLIC_MAPBOX_TOKEN` in environment. Map tiles may fail to load.
        </div>
      ) : null}
      <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-primary/20">
        {!geojson ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
            Loading Kisumu ward boundaries...
          </div>
        ) : null}

      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller layers={layers}>
        <Map
          mapboxAccessToken={mapboxToken}
          mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
        >
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>

      {hoverInfo?.object && (
        <div
          className="pointer-events-none absolute z-10 max-w-[240px] rounded-md border border-border bg-popover/95 px-2 py-1.5 text-xs text-popover-foreground shadow-md"
          style={{ left: hoverInfo.x + 10, top: hoverInfo.y + 10 }}
        >
          {"coordinates" in hoverInfo.object ? (
            <>
              <p className="font-medium">Beneficiary point</p>
              <p className="text-muted-foreground">{hoverInfo.object.impactArea}</p>
              <p className="text-muted-foreground">{hoverInfo.object.sector}</p>
              <p className="text-muted-foreground">{hoverInfo.object.ward}</p>
              <p className="text-muted-foreground">Impact score: {hoverInfo.object.impactScore}</p>
            </>
          ) : (
            <>
              <p className="font-medium">{getFeatureName(hoverInfo.object)}</p>
              <p className="text-muted-foreground">
                Ward impact:{" "}
                {normalizedWardImpactData[normalizeName(getFeatureName(hoverInfo.object))] ?? "No data"}
              </p>
            </>
          )}
        </div>
      )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Heat legend</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-[rgb(56,132,255)]" />
          Lower impact (&lt;40)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-[rgb(255,195,95)]" />
          Medium (40-69)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-[rgb(255,96,130)]" />
          High impact (70+)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full border border-primary bg-white" />
          Beneficiary dots (admin only)
        </span>
      </div>
    </div>
  );
}
