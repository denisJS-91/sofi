#!/bin/bash

URL="http://localhost:3000/chat"
REPORT="sofi-report-v3.json"

echo "===================================="
echo "🧠 SOFI TOOLKIT v3 (AI QA ENGINE)"
echo "===================================="

echo "{" > $REPORT
echo "\"tests\": [" >> $REPORT

total=0
passed=0
failed=0

declare -A MEMORY_MAP

send () {
  local msg="$1"
  local expected="$2"
  local test_name="$3"
  local category="$4"

  echo ""
  echo "➡️ [$category] $test_name"
  echo "USER: $msg"

  start=$(date +%s%N)

  response=$(curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$msg\",\"userId\":\"test1\"}")

  end=$(date +%s%N)

  latency=$(( (end - start) / 1000000 ))

  echo "RESPONSE: $response"
  echo "LATENCY: ${latency}ms"

  total=$((total+1))

  # -------------------------
  # CRASH DETECTION
  # -------------------------
  if [[ -z "$response" || "$response" == "null" ]]; then
    echo "❌ CRASH DETECTED"
    failed=$((failed+1))
    status="crash"
  else
    # -------------------------
    # MEMORY CHECK
    # -------------------------
    if [[ -n "$expected" ]]; then
      if [[ "$response" == *"$expected"* ]]; then
        echo "✅ MEMORY PASS"
        passed=$((passed+1))
        status="pass"
      else
        echo "❌ MEMORY FAIL"
        failed=$((failed+1))
        status="fail"
      fi
    else
      echo "ℹ️ NO EXPECTATION"
      status="neutral"
    fi
  fi

  # -------------------------
  # STORE FOR REGRESSION
  # -------------------------
  key="$test_name"
  MEMORY_MAP[$key]="$response"

  # -------------------------
  # SAVE JSON
  # -------------------------
  echo "{" >> $REPORT
  echo "\"test\":\"$test_name\"," >> $REPORT
  echo "\"category\":\"$category\"," >> $REPORT
  echo "\"input\":\"$msg\"," >> $REPORT
  echo "\"response\":\"$response\"," >> $REPORT
  echo "\"expected\":\"$expected\"," >> $REPORT
  echo "\"status\":\"$status\"," >> $REPORT
  echo "\"latency_ms\":$latency" >> $REPORT
  echo "}," >> $REPORT
}

# =========================
# 🧪 MEMORY TESTS
# =========================

send "меня зовут Денис" "Денис" "identity-save" "memory"
send "как меня зовут?" "Денис" "identity-recall" "memory"

send "я из Германии" "Германия" "origin-save" "memory"
send "откуда я?" "Германия" "origin-recall" "memory"

send "я люблю кофе" "кофе" "likes-save" "memory"
send "что я люблю?" "кофе" "likes-recall" "memory"

# =========================
# 🧪 EMOTION TESTS
# =========================

send "мне плохо" "" "emotion-low" "emotion"
send "мне хорошо" "" "emotion-high" "emotion"

# =========================
# 🧪 CONTEXT TESTS
# =========================

send "привет" "" "hello-1" "context"
send "ты помнишь меня?" "" "memory-check" "context"
send "что я тебе говорил?" "" "context-recall" "context"

# =========================
# 🧪 NOISE TESTS
# =========================

send "123456" "" "noise-1" "noise"
send "asdfghjkl" "" "noise-2" "noise"
send "???" "" "noise-3" "noise"

# =========================
# 🧪 STRESS TEST
# =========================

for i in {1..5}
do
  send "stress test $i" "" "stress-$i" "stress"
done

# =========================
# FINAL SCORE
# =========================

echo "]" >> $REPORT
echo "}" >> $REPORT

score=$(( passed * 100 / total ))

echo ""
echo "===================================="
echo "📊 FINAL AI HEALTH REPORT"
echo "===================================="
echo "TOTAL TESTS: $total"
echo "PASSED: $passed"
echo "FAILED: $failed"
echo "SCORE: $score%"
echo "===================================="

# -------------------------
# HEALTH CLASSIFICATION
# -------------------------

if (( score >= 85 )); then
  echo "🟢 AI STATUS: HEALTHY"
elif (( score >= 60 )); then
  echo "🟡 AI STATUS: UNSTABLE"
else
  echo "🔴 AI STATUS: BROKEN"
fi

echo ""
echo "📦 REPORT: $REPORT"