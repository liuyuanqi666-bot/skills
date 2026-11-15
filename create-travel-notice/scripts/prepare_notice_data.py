#!/usr/bin/env python3
"""Parse a Chinese travel-notice source text into validated JSON."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path


SECTION_LABELS = {
    "描述": "description",
    "交通安排": "transport",
    "住宿安排": "accommodation",
    "餐食安排": "meals_raw",
    "购物安排": "shopping",
    "娱乐安排": "entertainment",
}


def read_text(path: Path) -> tuple[str, str]:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "gb18030", "utf-16"):
        try:
            return raw.decode(encoding), encoding
        except UnicodeDecodeError:
            continue
    raise ValueError(f"无法识别文本编码：{path}")


def clean_lines(text: str) -> list[str]:
    return [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]


def parse_flight(lines: list[str]) -> dict | None:
    joined = " ".join(line.strip() for line in lines if line.strip())
    pattern = re.compile(
        r"(?:参考)?航班\s*[:：]?\s*([A-Za-z0-9]+)\s+"
        r"(.+?)\s*→\s*([^\s（(]+)\s*"
        r"[（(]\s*(\d{1,2}:\d{2})\s*[–—－-]\s*(\d{1,2}:\d{2})\s*[）)]"
    )
    match = pattern.search(joined)
    if not match:
        return None
    number, origin, destination, departure_time, arrival_time = match.groups()
    return {
        "number": number.strip(),
        "origin": origin.strip(),
        "destination": destination.strip(),
        "departure_time": departure_time.zfill(5),
        "arrival_time": arrival_time.zfill(5),
    }


def parse_meals(raw: str) -> dict:
    compact = " ".join(part.strip() for part in raw.splitlines() if part.strip())
    match = re.search(
        r"早餐\s*[:：]\s*(.*?)\s+午餐\s*[:：]\s*(.*?)\s+晚餐\s*[:：]\s*(.*)$",
        compact,
    )
    if not match:
        return {"breakfast": "", "lunch": "", "dinner": "", "raw": compact}
    breakfast, lunch, dinner = match.groups()
    return {
        "breakfast": breakfast.strip(),
        "lunch": lunch.strip(),
        "dinner": dinner.strip(),
        "raw": compact,
    }


def compact_transport(lines: list[str], flight: dict | None) -> list[str]:
    result: list[str] = []
    if flight:
        result.append(
            f"{flight['number']}（{flight['departure_time']}–{flight['arrival_time']}）"
        )
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if flight and ("航班" in stripped and flight["number"] in stripped):
            continue
        result.append(stripped)
    return result


def parse_day(day_number: int, block: list[str]) -> dict:
    nonempty_indices = [i for i, line in enumerate(block) if line.strip()]
    if not nonempty_indices:
        return {
            "day": day_number,
            "city": "",
            "description": "",
            "transport_lines": [],
            "transport_display": [],
            "accommodation": "",
            "meals": parse_meals(""),
            "shopping": "",
            "entertainment": "",
            "flight": None,
        }

    city_index = nonempty_indices[0]
    city = block[city_index].strip()
    sections: dict[str, list[str]] = {value: [] for value in SECTION_LABELS.values()}
    current: str | None = None

    for line in block[city_index + 1 :]:
        matched_label = None
        for label, key in SECTION_LABELS.items():
            label_match = re.match(rf"^\s*{re.escape(label)}\s*[:：]\s*(.*)$", line)
            if label_match:
                matched_label = (key, label_match.group(1))
                break
        if matched_label:
            current, remainder = matched_label
            if remainder:
                sections[current].append(remainder.rstrip())
            continue
        if current is not None and line.strip():
            sections[current].append(line.rstrip())

    description = "\n".join(sections["description"]).strip("\n")
    transport_lines = [line for line in sections["transport"] if line.strip()]
    flight = parse_flight(transport_lines)
    meals_raw = "\n".join(sections["meals_raw"]).strip("\n")

    return {
        "day": day_number,
        "city": city,
        "description": description,
        "transport_lines": transport_lines,
        "transport_display": compact_transport(transport_lines, flight),
        "accommodation": "\n".join(sections["accommodation"]).strip("\n"),
        "meals": parse_meals(meals_raw),
        "shopping": "\n".join(sections["shopping"]).strip("\n"),
        "entertainment": "\n".join(sections["entertainment"]).strip("\n"),
        "flight": flight,
    }


def parse_source(text: str) -> tuple[str, list[dict]]:
    group_match = re.search(r"团号\s*[:：]\s*([^\s]+)", text)
    group_no = group_match.group(1).strip() if group_match else ""
    lines = clean_lines(text)
    day_markers: list[tuple[int, int]] = []
    for index, line in enumerate(lines):
        match = re.match(r"^\s*第\s*(\d+)\s*天\s*[:：]\s*$", line)
        if match:
            day_markers.append((index, int(match.group(1))))

    days: list[dict] = []
    for marker_index, (line_index, day_number) in enumerate(day_markers):
        end = day_markers[marker_index + 1][0] if marker_index + 1 < len(day_markers) else len(lines)
        days.append(parse_day(day_number, lines[line_index + 1 : end]))
    return group_no, days


def infer_departure_date(group_no: str) -> str | None:
    match = re.search(r"(\d{6})", group_no)
    if not match:
        return None
    try:
        return datetime.strptime(match.group(1), "%y%m%d").date().isoformat()
    except ValueError:
        return None


def format_cn_date(value: str) -> str:
    parsed = datetime.strptime(value, "%Y-%m-%d").date()
    return f"{parsed.month}月{parsed.day}日"


def main() -> int:
    parser = argparse.ArgumentParser(description="准备出行通知书结构化数据")
    parser.add_argument("source_text", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--product-name", default="")
    parser.add_argument("--leader-name", default="")
    parser.add_argument("--leader-phone", default="")
    parser.add_argument("--departure-date", help="YYYY-MM-DD")
    parser.add_argument("--return-date", help="YYYY-MM-DD")
    parser.add_argument("--arrival-datetime", help="YYYY-MM-DD HH:MM")
    parser.add_argument("--itinerary-title")
    parser.add_argument("--confirm-inferences", action="store_true")
    parser.add_argument("--require-ready", action="store_true")
    args = parser.parse_args()

    text, encoding = read_text(args.source_text)
    group_no, days = parse_source(text)
    inferred_departure = infer_departure_date(group_no)
    inferred_return = None
    if inferred_departure and days:
        inferred_return = (
            datetime.strptime(inferred_departure, "%Y-%m-%d").date()
            + timedelta(days=len(days) - 1)
        ).isoformat()

    outbound = days[0]["flight"] if days else None
    return_flight = days[-1]["flight"] if days else None
    inferred_arrival = None
    if inferred_departure and outbound:
        departure_dt = datetime.strptime(
            f"{inferred_departure} {outbound['departure_time']}", "%Y-%m-%d %H:%M"
        )
        inferred_arrival = (departure_dt - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M")

    departure_date = args.departure_date or inferred_departure or ""
    return_date = args.return_date or inferred_return or ""
    arrival_datetime = args.arrival_datetime or inferred_arrival or ""
    itinerary_title = args.itinerary_title or (
        f"{group_no}—{args.product_name}" if group_no and args.product_name else ""
    )

    missing: list[str] = []
    confirmations: list[str] = []
    warnings: list[str] = []

    required_values = {
        "团号": group_no,
        "产品名称": args.product_name,
        "领队姓名": args.leader_name,
        "领队电话": args.leader_phone,
        "出发日期": departure_date,
        "回程日期": return_date,
        "抵达机场日期时间": arrival_datetime,
        "行程表标题": itinerary_title,
        "出发航班": outbound,
        "回程航班": return_flight,
    }
    missing.extend(label for label, value in required_values.items() if not value)
    if not days:
        missing.append("逐日行程")

    for day in days:
        if not day["city"]:
            missing.append(f"第{day['day']}天城市")
        if not day["description"]:
            missing.append(f"第{day['day']}天描述")
        if not day["transport_lines"]:
            missing.append(f"第{day['day']}天交通")
        meals = day["meals"]
        if not all(meals[key] for key in ("breakfast", "lunch", "dinner")):
            missing.append(f"第{day['day']}天餐食")

    if not args.confirm_inferences:
        if not args.departure_date and inferred_departure:
            confirmations.append(f"出发日期按团号推定为 {inferred_departure}")
        if not args.return_date and inferred_return:
            confirmations.append(f"回程日期按行程天数推定为 {inferred_return}")
        if not args.arrival_datetime and inferred_arrival:
            confirmations.append(f"抵达机场时间按起飞前3小时推定为 {inferred_arrival}")

    if args.leader_phone and not re.fullmatch(r"1\d{10}", args.leader_phone):
        warnings.append("领队电话不是11位中国大陆手机号，请人工确认")
    if days and [day["day"] for day in days] != list(range(1, len(days) + 1)):
        warnings.append("行程天数编号不连续")

    result = {
        "source": {
            "path": str(args.source_text.resolve()),
            "encoding": encoding,
        },
        "group_no": group_no,
        "product_name": args.product_name,
        "leader": {"name": args.leader_name, "phone": args.leader_phone},
        "departure_date": departure_date,
        "return_date": return_date,
        "departure_date_cn": format_cn_date(departure_date) if departure_date else "",
        "return_date_cn": format_cn_date(return_date) if return_date else "",
        "airport_arrival_datetime": arrival_datetime,
        "itinerary_title": itinerary_title,
        "outbound_flight": outbound,
        "return_flight": return_flight,
        "days": days,
        "inferred": {
            "departure_date": inferred_departure,
            "return_date": inferred_return,
            "airport_arrival_datetime": inferred_arrival,
        },
        "validation": {
            "ready": not missing and not confirmations and not warnings,
            "missing": sorted(set(missing)),
            "confirmation_required": confirmations,
            "warnings": warnings,
        },
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(result["validation"], ensure_ascii=False))
    if args.require_ready and not result["validation"]["ready"]:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
