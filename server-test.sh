#!/bin/bash

echo "================================================"
echo "        SERVER BENCHMARK & STABILITY TEST"
echo "================================================"
echo "Started at: $(date)"
echo ""

# Install tools
echo "[0/6] Cài tools benchmark..."
sudo apt-get install -y sysbench sysstat curl > /dev/null 2>&1
echo "Done."
echo ""

# --- CPU ---
echo "================================================"
echo "[1/6] CPU BENCHMARK (6 threads, ~30s)"
echo "================================================"
sysbench cpu --cpu-max-prime=20000 --threads=6 run | grep -E "total time|events per second|min:|max:|avg:"
echo ""

echo "--- CPU STEAL TIME (15 giây, xem cột 'st') ---"
vmstat 1 15
echo ""

# --- RAM ---
echo "================================================"
echo "[2/6] MEMORY BANDWIDTH"
echo "================================================"
sysbench memory --memory-total-size=10G --threads=6 run | grep -E "total time|MiB/sec|transferred"
echo ""

# --- DISK ---
echo "================================================"
echo "[3/6] DISK PERFORMANCE (sustained 1GB)"
echo "================================================"
echo "--- WRITE ---"
dd if=/dev/zero of=/tmp/testwrite bs=1M count=1024 oflag=direct 2>&1

echo "--- READ ---"
dd if=/tmp/testwrite of=/dev/null bs=1M iflag=direct 2>&1

rm -f /tmp/testwrite
echo ""

# --- NETWORK SPEED ---
echo "================================================"
echo "[4/6] NETWORK SPEED"
echo "================================================"
curl -s https://raw.githubusercontent.com/sivel/speedtest-cli/master/speedtest.py | python3 - --simple
echo ""

# --- LATENCY STABILITY ---
echo "================================================"
echo "[5/6] LATENCY STABILITY"
echo "================================================"
echo "--- Ping 8.8.8.8 (30 lần) ---"
ping -c 30 8.8.8.8 | tail -4

echo "--- Ping VNPT Vietnam (10 lần) ---"
ping -c 10 203.162.4.190 | tail -4
echo ""

# --- SYSTEM SUMMARY ---
echo "================================================"
echo "[6/6] SYSTEM SUMMARY"
echo "================================================"
echo "--- CPU Info ---"
lscpu | grep -E "Model name|CPU\(s\)|Thread|Core"

echo "--- Memory ---"
free -h

echo "--- Disk ---"
df -h /

echo "--- Uptime & Load ---"
uptime

echo "--- Virtualization ---"
systemd-detect-virt 2>/dev/null

echo ""
echo "================================================"
echo "TEST HOÀN THÀNH: $(date)"
echo "================================================"
