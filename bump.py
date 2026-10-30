#!/usr/bin/env python3
import json, sys
from pathlib import Path

version = sys.argv[1]

for f in Path("app").rglob("package.json"):
    data = json.loads(f.read_text())
    data["version"] = version
    f.write_text(json.dumps(data, indent=2) + "\n")
    print(f"{f}: → {version}")