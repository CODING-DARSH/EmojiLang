#!/usr/bin/env python3
"""
Injector test runner for EmojiLang backend.

Usage:
  python injector_test.py
  python injector_test.py --base-url http://127.0.0.1:5000
  python injector_test.py --base-url http://127.0.0.1:5000 --admin-token your_token

Notes:
- Expects backend to be running already.
- Uses only Python standard library (no extra package install required).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import traceback
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple


@dataclass
class TestResult:
    name: str
    ok: bool
    status_code: Optional[int] = None
    detail: str = ""


class InjectorRunner:
    def __init__(self, base_url: str, admin_token: str = "", timeout: float = 6.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.admin_token = admin_token.strip()
        self.timeout = timeout
        self.results: list[TestResult] = []

    def run(self) -> int:
        print(f"[injector] base_url={self.base_url}")

        self._run_test("GET /ping", self.test_ping)
        self._run_test("GET /participant", self.test_participant)
        self._run_test("GET /display", self.test_display)
        self._run_test("GET /evaluation", self.test_evaluation)
        self._run_test("POST /run basic execution", self.test_run_basic)
        self._run_test("POST /run timeout guard", self.test_run_timeout)
        self._run_test("POST /run size guard", self.test_run_size_guard)
        self._run_test("POST /api/round2/submit invalid module", self.test_round2_invalid_module)

        module_id = "m1"
        flashed = self._run_test("POST /api/flash publish module", lambda: self.test_flash_publish(module_id))
        if not flashed and not self.admin_token:
            print("[injector] flash publish failed without token; if ADMIN_API_TOKEN is set on server, re-run with --admin-token")

        self._run_test("GET /api/flash/state", lambda: self.test_flash_state(module_id, flashed))
        self._run_test("POST /api/round2/submit missing team", lambda: self.test_round2_missing_team(module_id))

        team_name = f"InjectorTeam-{int(time.time())}"
        self._run_test("POST /api/round2/submit valid payload", lambda: self.test_round2_valid_submit(module_id, team_name))
        self._run_test("POST /api/round2/hint", lambda: self.test_round2_hint(module_id, team_name))
        self._run_test("POST /api/round2/prompt-preview", lambda: self.test_prompt_preview(module_id))
        self._run_test("GET /api/submissions/state", self.test_submissions_state)
        self._run_test("GET /api/leaderboard/state", self.test_leaderboard_state)

        return self.print_summary()

    def _run_test(self, name: str, fn) -> bool:
        try:
            result = fn()
        except Exception as exc:
            detail = f"Unhandled error: {exc}\n{traceback.format_exc(limit=1).strip()}"
            result = TestResult(name=name, ok=False, detail=detail)

        self.results.append(result)
        badge = "PASS" if result.ok else "FAIL"
        status = f" status={result.status_code}" if result.status_code is not None else ""
        detail = f" | {result.detail}" if result.detail else ""
        print(f"[{badge}] {name}{status}{detail}")
        return result.ok

    def _request(
        self,
        path: str,
        method: str = "GET",
        payload: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Tuple[int, Dict[str, str], str]:
        url = f"{self.base_url}{path}"
        req_headers = {"Accept": "application/json, text/plain, */*"}
        if headers:
            req_headers.update(headers)

        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            req_headers["Content-Type"] = "application/json"

        request = urllib.request.Request(url, data=data, headers=req_headers, method=method)

        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = response.read().decode("utf-8", errors="replace")
                return int(response.status), dict(response.headers.items()), raw
        except urllib.error.HTTPError as err:
            raw = err.read().decode("utf-8", errors="replace")
            return int(err.code), dict(err.headers.items()) if err.headers else {}, raw

    @staticmethod
    def _parse_json(raw: str) -> Optional[Dict[str, Any]]:
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return None
        return parsed if isinstance(parsed, dict) else None

    def _admin_headers(self) -> Dict[str, str]:
        if not self.admin_token:
            return {}
        return {"X-Admin-Token": self.admin_token}

    def test_ping(self) -> TestResult:
        status, _, body = self._request("/ping")
        ok = status == 200 and body.strip() == "pong"
        return TestResult("GET /ping", ok, status, "expected pong" if not ok else "")

    def test_participant(self) -> TestResult:
        status, _, body = self._request("/participant")
        ok = status == 200 and "<!DOCTYPE html" in body
        return TestResult("GET /participant", ok, status, "expected HTML document" if not ok else "")

    def test_display(self) -> TestResult:
        status, _, body = self._request("/display")
        ok = status == 200 and "<!DOCTYPE html" in body
        return TestResult("GET /display", ok, status, "expected HTML document" if not ok else "")

    def test_evaluation(self) -> TestResult:
        status, _, body = self._request("/evaluation")
        ok = status == 200 and "<!DOCTYPE html" in body
        return TestResult("GET /evaluation", ok, status, "expected HTML document" if not ok else "")

    def test_run_basic(self) -> TestResult:
        payload = {"code": "print('injector-ok')"}
        status, _, body = self._request("/run", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("exitCode") == 0
            and "injector-ok" in str(data.get("stdout", ""))
        )
        return TestResult("POST /run basic execution", ok, status, "unexpected run output" if not ok else "")

    def test_run_timeout(self) -> TestResult:
        payload = {"code": "while True:\n    pass"}
        status, _, body = self._request("/run", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("exitCode") == 1
            and "TimeoutError" in str(data.get("stderr", ""))
        )
        return TestResult("POST /run timeout guard", ok, status, "timeout guard not enforced" if not ok else "")

    def test_run_size_guard(self) -> TestResult:
        payload = {"code": "a" * 6001}
        status, _, body = self._request("/run", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("exitCode") == 1
            and "Code too large" in str(data.get("stderr", ""))
        )
        return TestResult("POST /run size guard", ok, status, "size guard not enforced" if not ok else "")

    def test_round2_invalid_module(self) -> TestResult:
        payload = {
            "teamName": "InjectorBadModule",
            "moduleId": "m999",
            "decodedGuess": "test",
            "code": "print('x')",
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        status, _, body = self._request("/api/round2/submit", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = status == 400 and isinstance(data, dict) and "Invalid moduleId" in str(data.get("error", ""))
        return TestResult("POST /api/round2/submit invalid module", ok, status, "invalid module should be rejected" if not ok else "")

    def test_flash_publish(self, module_id: str) -> TestResult:
        payload = {
            "moduleId": module_id,
            "name": "Injector Dataset",
            "emojis": "🔎🧩",
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        headers = self._admin_headers()
        status, _, body = self._request("/api/flash", method="POST", payload=payload, headers=headers)
        data = self._parse_json(body)

        # Local dev allows empty admin token; production likely requires token.
        if status == 401 and not self.admin_token:
            return TestResult("POST /api/flash publish module", True, status, "unauthorized as expected (token required)")

        ok = status == 200 and isinstance(data, dict) and data.get("ok") is True
        return TestResult("POST /api/flash publish module", ok, status, "flash publish failed" if not ok else "")

    def test_flash_state(self, module_id: str, flashed: bool) -> TestResult:
        status, _, body = self._request("/api/flash/state")
        data = self._parse_json(body)
        if not isinstance(data, dict) or status != 200:
            return TestResult("GET /api/flash/state", False, status, "invalid flash state response")

        state = data.get("state") if isinstance(data.get("state"), dict) else {}
        if flashed:
            ok = str(state.get("moduleId", "")) == module_id
            return TestResult("GET /api/flash/state", ok, status, "moduleId mismatch after flash" if not ok else "")

        # If not flashed (auth required), endpoint is still healthy if it returns shape.
        return TestResult("GET /api/flash/state", True, status, "")

    def test_round2_missing_team(self, module_id: str) -> TestResult:
        payload = {
            "teamName": "",
            "moduleId": module_id,
            "decodedGuess": "binary search",
            "code": "def solve(a,t):\n    return -1",
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        status, _, body = self._request("/api/round2/submit", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = status == 400 and isinstance(data, dict) and "teamName is required" in str(data.get("error", ""))
        return TestResult("POST /api/round2/submit missing team", ok, status, "missing team should be rejected" if not ok else "")

    def test_round2_valid_submit(self, module_id: str, team_name: str) -> TestResult:
        payload = {
            "teamName": team_name,
            "moduleId": module_id,
            "decodedGuess": "Binary search on sorted array",
            "code": (
                "def solve(nums, target):\n"
                "    left, right = 0, len(nums)-1\n"
                "    while left <= right:\n"
                "        mid = (left + right) // 2\n"
                "        if nums[mid] == target:\n"
                "            return mid\n"
                "        if nums[mid] < target:\n"
                "            left = mid + 1\n"
                "        else:\n"
                "            right = mid - 1\n"
                "    return -1\n"
            ),
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        status, _, body = self._request("/api/round2/submit", method="POST", payload=payload)
        data = self._parse_json(body)

        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("ok") is True
            and isinstance(data.get("evaluation"), dict)
            and isinstance(data.get("team"), dict)
            and int(data.get("evaluation", {}).get("totalScore", -1)) >= 0
        )
        return TestResult("POST /api/round2/submit valid payload", ok, status, "valid submit did not return expected shape" if not ok else "")

    def test_round2_hint(self, module_id: str, team_name: str) -> TestResult:
        payload = {
            "teamName": team_name,
            "moduleId": module_id,
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        status, _, body = self._request("/api/round2/hint", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("ok") is True
            and isinstance(data.get("team"), dict)
            and isinstance(data.get("penalty"), int)
        )
        return TestResult("POST /api/round2/hint", ok, status, "hint request failed" if not ok else "")

    def test_prompt_preview(self, module_id: str) -> TestResult:
        payload = {
            "moduleId": module_id,
            "decodedGuess": "binary search",
            "code": "print('preview')",
        }
        status, _, body = self._request("/api/round2/prompt-preview", method="POST", payload=payload)
        data = self._parse_json(body)
        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("ok") is True
            and isinstance(data.get("systemPrompt"), str)
            and isinstance(data.get("userPrompt"), str)
        )
        return TestResult("POST /api/round2/prompt-preview", ok, status, "prompt preview failed" if not ok else "")

    def test_submissions_state(self) -> TestResult:
        status, _, body = self._request("/api/submissions/state")
        data = self._parse_json(body)
        ok = status == 200 and isinstance(data, dict) and data.get("ok") is True and "recent" in data
        return TestResult("GET /api/submissions/state", ok, status, "submissions state malformed" if not ok else "")

    def test_leaderboard_state(self) -> TestResult:
        status, _, body = self._request("/api/leaderboard/state")
        data = self._parse_json(body)
        ok = (
            status == 200
            and isinstance(data, dict)
            and data.get("ok") is True
            and isinstance(data.get("state"), dict)
            and isinstance(data.get("state", {}).get("teams", []), list)
        )
        return TestResult("GET /api/leaderboard/state", ok, status, "leaderboard state malformed" if not ok else "")

    def print_summary(self) -> int:
        passed = sum(1 for r in self.results if r.ok)
        failed = len(self.results) - passed

        print("\n[injector] summary")
        print(f"[injector] passed={passed} failed={failed} total={len(self.results)}")

        if failed:
            print("[injector] failed tests:")
            for result in self.results:
                if not result.ok:
                    status = f" status={result.status_code}" if result.status_code is not None else ""
                    print(f"  - {result.name}{status}: {result.detail or 'no details'}")
            return 1
        return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Injector script to test EmojiLang system endpoints.")
    parser.add_argument("--base-url", default=os.environ.get("EMOJILANG_BASE_URL", "http://127.0.0.1:5000"), help="Base URL of running backend")
    parser.add_argument("--admin-token", default=os.environ.get("ADMIN_API_TOKEN", ""), help="Admin API token for protected publish endpoints")
    parser.add_argument("--timeout", type=float, default=6.0, help="HTTP timeout seconds")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    runner = InjectorRunner(base_url=args.base_url, admin_token=args.admin_token, timeout=args.timeout)
    return runner.run()


if __name__ == "__main__":
    sys.exit(main())
