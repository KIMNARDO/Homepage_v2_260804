from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


def connected_components(mask: np.ndarray) -> list[np.ndarray]:
    height, width = mask.shape
    visited = np.zeros_like(mask, dtype=np.uint8)
    components: list[np.ndarray] = []

    for y in range(height):
        for x in range(width):
            if not mask[y, x] or visited[y, x]:
                continue

            queue: deque[int] = deque([y * width + x])
            visited[y, x] = 1
            pixels: list[int] = []

            while queue:
                index = queue.pop()
                pixels.append(index)
                py, px = divmod(index, width)

                for ny in range(max(0, py - 1), min(height, py + 2)):
                    for nx in range(max(0, px - 1), min(width, px + 2)):
                        if mask[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = 1
                            queue.append(ny * width + nx)

            components.append(np.asarray(pixels, dtype=np.int32))

    return components


def component_metrics(component: np.ndarray, width: int) -> dict[str, float | int]:
    ys = component // width
    xs = component % width
    x = int(xs.min())
    y = int(ys.min())
    right = int(xs.max()) + 1
    bottom = int(ys.max()) + 1
    return {
        "x": x,
        "y": y,
        "width": right - x,
        "height": bottom - y,
        "area": int(component.size),
        "cx": float(xs.mean()),
        "cy": float(ys.mean()),
    }


def pack_atlas(
    rgba: np.ndarray,
    selected: list[tuple[np.ndarray, dict[str, float | int]]],
    atlas_width: int,
    padding: int,
) -> tuple[Image.Image, list[dict[str, float | int]]]:
    source_height, source_width = rgba.shape[:2]
    packed: list[dict[str, float | int]] = []
    rows: list[tuple[int, int, int, Image.Image, dict[str, float | int]]] = []

    cursor_x = padding
    cursor_y = padding
    row_height = 0

    ordered = sorted(selected, key=lambda item: int(item[1]["height"]), reverse=True)

    for component, metrics in ordered:
        x = int(metrics["x"])
        y = int(metrics["y"])
        width = int(metrics["width"])
        height = int(metrics["height"])
        ys = component // source_width
        xs = component % source_width

        crop = np.zeros((height, width, 4), dtype=np.uint8)
        crop[ys - y, xs - x] = rgba[ys, xs]
        crop_image = Image.fromarray(crop, mode="RGBA")

        if cursor_x + width + padding > atlas_width:
            cursor_x = padding
            cursor_y += row_height + padding
            row_height = 0

        rows.append((cursor_x, cursor_y, width, crop_image, metrics))
        cursor_x += width + padding
        row_height = max(row_height, height)

    atlas_height = cursor_y + row_height + padding
    atlas = Image.new("RGBA", (atlas_width, atlas_height), (0, 0, 0, 0))

    for atlas_x, atlas_y, width, crop_image, metrics in rows:
        atlas.alpha_composite(crop_image, (atlas_x, atlas_y))
        packed.append(
            {
                **metrics,
                "atlasX": atlas_x,
                "atlasY": atlas_y,
                "atlasWidth": width,
                "atlasHeight": crop_image.height,
            }
        )

    return atlas, packed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--max-parts", type=int, default=120)
    parser.add_argument("--min-area", type=int, default=28)
    parser.add_argument("--atlas-width", type=int, default=2048)
    parser.add_argument(
        "--anchor-mode",
        choices=("largest", "center"),
        default="largest",
        help="Choose the largest component or a substantial center component as the fixed datum.",
    )
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    rgba = np.asarray(image)
    source_height, source_width = rgba.shape[:2]
    mask = rgba[:, :, 3] > 20

    components = connected_components(mask)
    measured = [
        (component, component_metrics(component, source_width))
        for component in components
        if component.size >= args.min_area
    ]
    measured.sort(key=lambda item: int(item[1]["area"]), reverse=True)
    selected = measured[: args.max_parts]

    args.output_dir.mkdir(parents=True, exist_ok=True)
    atlas, packed = pack_atlas(rgba, selected, args.atlas_width, padding=3)
    atlas_path = args.output_dir / "ev-parts-atlas.png"
    atlas.save(atlas_path, optimize=True)

    residual = rgba.copy()
    for component, _ in selected:
        ys = component // source_width
        xs = component % source_width
        residual[ys, xs, 3] = 0
    residual_path = args.output_dir / "ev-parts-residual.png"
    Image.fromarray(residual, mode="RGBA").save(residual_path, optimize=True)

    center_x = source_width / 2
    center_y = source_height / 2

    for part in packed:
        distance = (
            ((float(part["cx"]) - center_x) / source_width) ** 2
            + ((float(part["cy"]) - center_y) / source_height) ** 2
        ) ** 0.5
        part["distance"] = round(distance, 6)

    if args.anchor_mode == "center":
        center_candidates = [
            part for part in packed if float(part["distance"]) <= 0.14
        ]
        anchor = max(center_candidates or packed, key=lambda part: int(part["area"]))
    else:
        anchor = max(packed, key=lambda part: int(part["area"]))

    for part in packed:
        part["anchor"] = (
            part["x"] == anchor["x"]
            and part["y"] == anchor["y"]
            and part["area"] == anchor["area"]
        )

    # Keep the battery floor as the fixed product datum, then release the
    # largest recognizable modules before fasteners and small fittings.
    ordered_for_sequence = sorted(
        packed,
        key=lambda part: (
            not bool(part["anchor"]),
            -int(part["area"]),
            float(part["distance"]),
        ),
    )
    sequence_by_position = {
        (int(part["x"]), int(part["y"]), int(part["area"])): index
        for index, part in enumerate(ordered_for_sequence)
    }

    for part in packed:
        key = (int(part["x"]), int(part["y"]), int(part["area"]))
        part["sequence"] = sequence_by_position[key]

    manifest = {
        "sourceWidth": source_width,
        "sourceHeight": source_height,
        "atlasWidth": atlas.width,
        "atlasHeight": atlas.height,
        "selectedParts": len(packed),
        "detectedComponents": len(components),
        "minimumArea": args.min_area,
        "parts": sorted(packed, key=lambda part: int(part["sequence"])),
    }
    (args.output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    areas = [int(part["area"]) for part in packed]
    print(
        json.dumps(
            {
                "source": [source_width, source_height],
                "detected": len(components),
                "selected": len(packed),
                "atlas": [atlas.width, atlas.height],
                "largestArea": max(areas) if areas else 0,
                "smallestSelectedArea": min(areas) if areas else 0,
            }
        )
    )


if __name__ == "__main__":
    main()
